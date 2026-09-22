# Qual regua faz as duas formas variarem de verdade sem se cruzarem?
import numpy as np, librosa, sys
ARQ=sys.argv[1]; SR=44100; N=2048; H=1024; dt=H/SR
y,sr=librosa.load(ARQ,sr=SR,mono=True)
S=np.abs(librosa.stft(y,n_fft=N,hop_length=H,center=False))**2
f=librosa.fft_frequencies(sr=sr,n_fft=N)
g=(f>=30)&(f<=220); m=(f>=350)&(f<=6000)
Eg=S[g].sum(0); Em=S[m].sum(0)
ceng=(S[g]*f[g][:,None]).sum(0)/np.maximum(Eg,1e-12)
cenm=(S[m]*f[m][:,None]).sum(0)/np.maximum(Em,1e-12)
def suave(v,tau):
    a=np.exp(-dt/tau); o=np.zeros_like(v); acc=v[0]
    for i,x in enumerate(v): acc=a*acc+(1-a)*x; o[i]=acc
    return o
bg=2**suave(np.log2(np.maximum(ceng,1e-6)),0.180)
bm=2**suave(np.log2(np.maximum(cenm,1e-6)),0.180)
ok=(Eg>np.percentile(Eg,20))&(Em>np.percentile(Em,20))
bg,bm=bg[ok],bm[ok]

L=np.log2
def linear(fr, lo=55, hi=2913):
    return np.clip((L(fr)-L(lo))/(L(hi)-L(lo)),0,1)
def quebrada(fr, A, B, g0=30,g1=220,m0=350,m1=6000):
    """Regua monotona em tres trechos: faixa grave -> [0,A], vao -> [A,B], faixa media-aguda -> [B,1]."""
    x=L(np.asarray(fr,dtype=float)); out=np.empty_like(x)
    a=(x<=L(g1)); out[a]=A*np.clip((x[a]-L(g0))/(L(g1)-L(g0)),0,1)
    b=(x>L(g1))&(x<L(m0)); out[b]=A+(B-A)*(x[b]-L(g1))/(L(m0)-L(g1))
    c=(x>=L(m0)); out[c]=B+(1-B)*np.clip((x[c]-L(m0))/(L(m1)-L(m0)),0,1)
    return out

oct_g=L(220)-L(30); oct_m=L(6000)-L(350); tot=oct_g+oct_m
prop=0.90*oct_g/tot
opcoes=[("(a) linear em log2, 55-2913 Hz  [atual]", lambda fr: linear(fr)),
        ("(b) quebrada, vao=0,10, dividida por oitavas", lambda fr: quebrada(fr, prop, prop+0.10)),
        ("(c) quebrada, vao=0,10, metade para cada", lambda fr: quebrada(fr, 0.45, 0.55)),
        ("(d) quebrada, vao=0,20, metade para cada", lambda fr: quebrada(fr, 0.40, 0.60))]

print(f"faixa grave ocupa {oct_g:.2f} oitavas, media-aguda {oct_m:.2f}; divisao por oitavas daria A={prop:.2f}\n")
print(f"{'regua':46s}{'grave p5-p95':>22s}{'med-aguda p5-p95':>24s}{'folga':>8s}{'par 1':>8s}")
for nome,fn in opcoes:
    ag=fn(bg); am=fn(bm)
    pg=np.percentile(ag,[5,95]); pm=np.percentile(am,[5,95])
    folga=pm[0]-pg[1]
    par=abs(fn(np.array([2397.]))[0]-fn(np.array([1076.]))[0])
    print(f"{nome:46s}{pg[0]:7.2f}-{pg[1]:.2f} ({pg[1]-pg[0]:.2f}){pm[0]:11.2f}-{pm[1]:.2f} ({pm[1]-pm[0]:.2f}){folga:8.2f}{par:8.2f}")
print("\nfolga = distancia entre o topo da forma grave e a base da media-aguda; positiva = nunca se cruzam")
print("par 1 = quanto a angularidade anda entre 1.076 Hz e 2.397 Hz (o par de brilho medido)")
print("\ncom a opcao escolhida, pontos da regua para o texto:")
esc=quebrada
for fr in [30,55,100,170,220,350,855,1500,2913,6000]:
    print(f"   {fr:5d} Hz -> {esc(np.array([float(fr)]),0.45,0.55)[0]:.2f}")

print("\n\n=== segunda tentativa: expandir onde o som REALMENTE esta ===")
# Sobre a regua linear (a), expandir as duas janelas ocupadas e comprimir o meio vazio.
base_g=np.percentile(linear(bg),[5,95]); base_m=np.percentile(linear(bm),[5,95])
print(f"na regua (a), o grave ocupa {base_g[0]:.2f}-{base_g[1]:.2f} e a media-aguda {base_m[0]:.2f}-{base_m[1]:.2f}")
def ganho(v, g0,g1,m0,m1, saida=(0.0,0.40,0.60,1.0)):
    """Monotona: [g0,g1]->[s0,s1], [g1,m0]->[s1,s2], [m0,m1]->[s2,s3]. Fora, extrapola preso."""
    s0,s1,s2,s3=saida
    v=np.asarray(v,dtype=float)
    return np.clip(np.interp(v,[0,g0,g1,m0,m1,1],[0,s0,s1,s2,s3,1.0]),0,1)
for nome,saida in [("expandir 0,40 / 0,40", (0.0,0.40,0.60,1.0)),
                   ("expandir 0,35 / 0,35", (0.05,0.40,0.62,0.97)),
                   ("expandir 0,30 / 0,30", (0.05,0.35,0.65,0.95))]:
    ag=ganho(linear(bg),base_g[0],base_g[1],base_m[0],base_m[1],saida)
    am=ganho(linear(bm),base_g[0],base_g[1],base_m[0],base_m[1],saida)
    pg=np.percentile(ag,[5,95]); pm=np.percentile(am,[5,95])
    par=abs(ganho(linear(np.array([2397.])),base_g[0],base_g[1],base_m[0],base_m[1],saida)[0]
           -ganho(linear(np.array([1076.])),base_g[0],base_g[1],base_m[0],base_m[1],saida)[0])
    print(f"{nome:24s} grave {pg[0]:.2f}-{pg[1]:.2f} ({pg[1]-pg[0]:.2f})   med-aguda {pm[0]:.2f}-{pm[1]:.2f} ({pm[1]-pm[0]:.2f})   folga {pm[0]-pg[1]:.2f}   par 1: {par:.2f}")
