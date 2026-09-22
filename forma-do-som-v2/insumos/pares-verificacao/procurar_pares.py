# Procura PARES de instantes que isolam uma medida: diferem muito nela, pouco nas outras.
# Usa a leitura causal do v2 e a suavizacao que move a forma.
import numpy as np, librosa, sys
ARQ=sys.argv[1]; SR=44100; N=2048; H=1024; dt=H/SR
y,sr=librosa.load(ARQ,sr=SR,mono=True)
S=np.abs(librosa.stft(y,n_fft=N,hop_length=H,center=False))**2
f=librosa.fft_frequencies(sr=sr,n_fft=N); t=np.arange(S.shape[1])*dt
g=(f>=30)&(f<=220); m=(f>=350)&(f<=6000)
Eg=S[g].sum(0); Em=S[m].sum(0)
ceng=(S[g]*f[g][:,None]).sum(0)/np.maximum(Eg,1e-12)
cenm=(S[m]*f[m][:,None]).sum(0)/np.maximum(Em,1e-12)
flux=np.maximum(np.diff(np.sqrt(S[g]),axis=1,prepend=np.sqrt(S[g][:,:1])),0).sum(0)

def suave(v,tau):
    a=np.exp(-dt/tau); o=np.zeros_like(v); acc=v[0]
    for i,x in enumerate(v): acc=a*acc+(1-a)*x; o[i]=acc
    return o

# ataques com as tres travas (limiar adaptativo + 15% das faixas + refratario)
sub=(np.diff(np.sqrt(S[g]),axis=1,prepend=np.sqrt(S[g][:,:1]))>0).mean(0)
ataques=[]; ult=-9; njan=int(2.0/dt)
for i in range(len(flux)):
    j=flux[max(0,i-njan):i+1]
    if flux[i]>j.mean()+1.8*j.std()+1e-9 and sub[i]>=0.15 and t[i]-ult>=0.110:
        ataques.append(i); ult=t[i]
# envelope do acento: 25 ms de subida, 220 ms de queda
acento=np.zeros_like(flux)
for i in ataques:
    for k in range(i,min(len(t),i+int(0.25/dt))):
        idade=t[k]-t[i]
        e=(idade/0.025) if idade<0.025 else max(0,1-(idade-0.025)/(0.220-0.025))**2
        acento[k]=max(acento[k],e*min(1,flux[i]/np.percentile(flux,99)))

dBg=suave(10*np.log10(np.maximum(Eg,1e-20)),0.140)
dBm=suave(10*np.log10(np.maximum(Em,1e-20)),0.140)
bg=suave(np.log2(np.maximum(ceng,1e-6)),0.180)
bm=suave(np.log2(np.maximum(cenm,1e-6)),0.180)

def norm(v):
    lo,hi=np.percentile(v,5),np.percentile(v,95)
    return np.clip((v-lo)/max(hi-lo,1e-9),0,1)
# angularidade: regua absoluta compartilhada, 55 Hz a 2913 Hz
L0,L1=np.log2(55),np.log2(2913)
angg=np.clip((bg-L0)/(L1-L0),0,1); angm=np.clip((bm-L0)/(L1-L0),0,1)

M={"volume grave":norm(dBg),"volume med-agudo":norm(dBm),
   "brilho grave":norm(bg),"brilho med-agudo":norm(bm),"acento":acento}
nomes=list(M)
piso_g=np.percentile(Eg,20); piso_m=np.percentile(Em,20)
valido=(Eg>piso_g)&(Em>piso_m)
cand=[i for i in range(2,len(t)-2) if valido[i] and i%2==0]

def par(alvo, outras, exigir_estavel=True):
    melhor=None
    for a in cand:
        if exigir_estavel and np.std([M[alvo][a-2],M[alvo][a],M[alvo][a+2]])>0.05: continue
        for b in cand:
            if b<=a: continue
            if exigir_estavel and np.std([M[alvo][b-2],M[alvo][b],M[alvo][b+2]])>0.05: continue
            d=abs(M[alvo][a]-M[alvo][b])
            ruido=max(abs(M[o][a]-M[o][b]) for o in outras)
            pontos=d-1.5*ruido
            if melhor is None or pontos>melhor[0]: melhor=(pontos,a,b,d,ruido)
    return melhor

print(f"{len(ataques)} ataques aceitos com as tres travas\n")
# TODAS as outras medidas entram na penalidade, senao o par nao esta isolado
legendas={"brilho med-agudo":"linha V6/V2 — pontas e distribuicao y da forma media-aguda",
          "volume med-agudo":"linha V1 — extensao x da forma media-aguda",
          "volume grave":"linha V4 — extensao x da forma grave",
          "acento":"linha V3 — impacto da forma grave"}
alvos=[(a,[o for o in nomes if o!=a],legendas[a]) for a in legendas]
for alvo,outras,legenda in alvos:
    r=par(alvo,outras,exigir_estavel=(alvo!="acento"))
    if not r: print(f"-- {alvo}: sem par --\n"); continue
    _,a,b,d,ruido=r
    if M[alvo][a]>M[alvo][b]: a,b=b,a
    print(f"== {alvo.upper()}  ({legenda})")
    print(f"   par: {t[a]:.2f} s  x  {t[b]:.2f} s   diferenca no alvo {d*100:.0f} pontos, maior ruido nas outras {ruido*100:.0f}")
    print(f"   {'medida':20s}{'em '+format(t[a],'.2f')+' s':>16s}{'em '+format(t[b],'.2f')+' s':>16s}")
    for n in nomes:
        marca=" <-" if n==alvo else ""
        print(f"   {n:20s}{M[n][a]*100:15.0f}%{M[n][b]*100:15.0f}%{marca}")
    print(f"   {'brilho em Hz':20s}{2**bm[a]:14.0f} Hz{2**bm[b]:14.0f} Hz")
    print(f"   {'angularidade med-ag':20s}{angm[a]:15.2f}{angm[b]:15.2f}")
    print(f"   {'angularidade grave':20s}{angg[a]:15.2f}{angg[b]:15.2f}")
    print()
