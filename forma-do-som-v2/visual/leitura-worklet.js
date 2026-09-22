// A leitura do som, rodando num AudioWorklet.
// Fica FORA do ritmo da tela: ela mede a ~43 vezes por segundo mesmo que a tela
// esteja lenta ou a 120 Hz. É a armadilha que o TypePulse comete e o PRD evita.
// Aqui não se desenha nada: só se mede, e o resultado é enviado para a página.

// --- FFT radix-2, in-place. Transforma o pedaço de som em "quanto de cada frequência". ---
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {           // reordenação bit-reversa
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let tam = 2; tam <= n; tam <<= 1) {
    const ang = -2 * Math.PI / tam, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += tam) {
      let cr = 1, ci = 0;
      for (let j = 0; j < tam / 2; j++) {
        const a = i + j, b = a + tam / 2;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti;
        re[a] += tr;        im[a] += ti;
        const ncr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = ncr;
      }
    }
  }
}

// Filtro de um polo: sobe com uma constante de tempo e desce com outra.
// Contado em segundos, nunca em quadros (PRD, seção 4).
function umPolo(valor, alvo, dt, tauSubida, tauDescida) {
  const tau = (alvo > valor ? tauSubida : tauDescida) / 1000;
  const a = Math.exp(-dt / Math.max(tau, 1e-4));
  return a * valor + (1 - a) * alvo;
}

const dB = x => 10 * Math.log10(Math.max(x, 1e-20));

function percentil(arr, p) {
  const v = Array.from(arr).sort((a, b) => a - b);
  return v[Math.min(v.length - 1, Math.max(0, Math.round(p * (v.length - 1))))];
}

class Leitura extends AudioWorkletProcessor {
  constructor(opcoes) {
    super();
    const c = opcoes.processorOptions.config;
    this.c = c;
    this.N = c.janela; this.H = c.salto;
    this.dt = this.H / sampleRate;            // ~23 ms entre leituras

    // Buffer circular: escreve sempre na mesma posição que avança, em vez de
    // empurrar o array inteiro a cada amostra. Sem isso o áudio engasga.
    this.buffer = new Float32Array(this.N);
    this.escrita = 0;
    this.preenchido = 0;
    this.desdeUltimo = 0;
    this.trecho = new Float32Array(this.N);   // as N últimas amostras, em ordem

    this.janelaHann = new Float32Array(this.N);
    for (let i = 0; i < this.N; i++)
      this.janelaHann[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / this.N);

    const binHz = sampleRate / this.N;
    const raias = (min, max) => {
      const a = Math.max(1, Math.ceil(min / binHz)), b = Math.min(this.N / 2 - 1, Math.floor(max / binHz));
      return { a, b, n: b - a + 1 };
    };
    this.rGrave = raias(c.faixaGrave.min, c.faixaGrave.max);
    this.rMedio = raias(c.faixaMedioAgudo.min, c.faixaMedioAgudo.max);
    // Três sub-regiões por faixa, para a assimetria MEDIDA (seção 6, P7).
    // Três números por forma, não o espectro inteiro: é medida, não display.
    const sub = (min, max) => {
      const L = Math.log(min), H = Math.log(max), p = [];
      for (let i = 0; i < 3; i++)
        p.push(raias(Math.exp(L + (H - L) * i / 3), Math.exp(L + (H - L) * (i + 1) / 3)));
      return p;
    };
    this.subGrave = sub(c.faixaGrave.min, c.faixaGrave.max);
    this.subMedio = sub(c.faixaMedioAgudo.min, c.faixaMedioAgudo.max);
    this.binHz = binHz;

    this.magAnterior = new Float32Array(this.N / 2);
    this.histFluxo = [];                      // para a média e o desvio do detector
    this.tUltimoAtaque = -9;
    this.t = 0;

    // estado suavizado
    this.s = { eg: -90, em: -90, bg: 100, bm: 1000 };
    // Duas suavizações do MESMO brilho, cada uma para o seu uso:
    //   s.bg / s.bm  — lentas, movem a geometria da forma
    //   r.bg / r.bm  — rápidas, alimentam só o detector de pico
    // Juntas numa só, ou a forma treme (brilho varia 1,4 oitava em 2 s no
    // trecho de 3 a 5 s) ou o pico é amortecido. Separado em 21/09.
    this.r = { bg: 100, bm: 1000 };
    this.iniciado = false;
    // Envelope do transbordo, um por forma. Sobe na hora e cai devagar, como
    // o acento dos graves. Sem ele, um brilho que fica pairando perto do topo
    // da régua faz a forma piscar entre a base e o pico em vez de saltar.
    this.pico = { grave: 0, medio: 0 };
    // Base lenta do brilho: o que "estava soando" nos últimos segundos.
    // O pico é medido como salto sobre ela, não como altura absoluta.
    this.base = { grave: 0, medio: 0 };

    // histórico curto para a escala móvel
    this.nJanela = Math.round(c.normalizacao.janelaSeg / this.dt);
    this.histEg = []; this.histEm = [];
    // Semeia a janela móvel com os percentis da faixa inteira, quando a
    // calibração já os mediu. Sem isso, nos primeiros 3 segundos a escala é
    // calculada sobre meia dúzia de quadros e pula a cada leitura nova — era
    // o que fazia a forma dar cortes secos no começo.
    const sem = opcoes.processorOptions.semente;
    if (sem && sem.brilhoGrave) {
      // O brilho e a base do detector de pico também nascem calibrados.
      this.s.bg = sem.brilhoGrave; this.s.bm = sem.brilhoMedio;
      this.r.bg = sem.brilhoGrave; this.r.bm = sem.brilhoMedio;
      this.base.grave = Math.log2(sem.brilhoGrave);
      this.base.medio = Math.log2(sem.brilhoMedio);
      this.iniciado = true;
    }
    if (sem && sem.amostraGrave) {
      // A semente dá o FORMATO da distribuição, não a posição absoluta: a
      // passagem prévia e a reprodução medem por caminhos diferentes e ficaram
      // 7,6 dB apartadas no áudio de teste. Guardada aqui centrada na própria
      // mediana; a âncora vem das primeiras leituras ao vivo (ancorar()).
      const meio = a => a[Math.floor(a.length / 2)];
      const mG = meio(sem.amostraGrave), mM = meio(sem.amostraMedio);
      for (let i = 0; i < this.nJanela; i++) {
        const k = Math.round(i / Math.max(this.nJanela - 1, 1) * (sem.amostraGrave.length - 1));
        this.histEg.push(sem.amostraGrave[k] - mG);
        this.histEm.push(sem.amostraMedio[k] - mM);
      }
      this.ancorar = 8;             // ~0,2 s: só enquanto a suavização assenta
      this.amostraG = []; this.amostraM = [];
      this.reguaX = sem.reguaX || null;
      // deslocamento entre o que a passagem prévia mediu e o que a reprodução
      // mede; preenchido na ancoragem e usado para ler a régua compartilhada
      this.desloc = { grave: 0, medio: 0 };
    } else if (sem) {
      for (let i = 0; i < this.nJanela; i++) {
        const f = i / Math.max(this.nJanela - 1, 1);
        this.histEg.push(sem.grave[0] + f * (sem.grave[1] - sem.grave[0]));
        this.histEm.push(sem.medio[0] + f * (sem.medio[1] - sem.medio[0]));
      }
    }

    this.quadros = 0;
    // Aviso de fim, para a passagem prévia saber que leu a faixa inteira.
    this.port.onmessage = e => { if (e.data === 'fim') this.port.postMessage({ tipo: 'fim', quadros: this.quadros }); };
    this.port.postMessage({ tipo: 'pronto', taxaLeitura: 1 / this.dt, binHz,
      raiasGrave: this.rGrave.n, raiasMedio: this.rMedio.n });
  }

  // Régua absoluta compartilhada + expansão calibrada (PRD 4.4, seção 5).
  // Monótona: mais agudo é sempre mais pontudo, e a forma grave nunca
  // alcança a média-aguda.
  angularidade(hz) {
    const A = this.c.angularidade;
    const L = Math.log2;
    const linear = Math.max(0,
      (L(Math.max(hz, 1)) - L(A.reguaMinHz)) / (L(A.reguaMaxHz) - L(A.reguaMinHz)));
    const ent = [0, ...A.expansao.entrada, 1], sai = [0, ...A.expansao.saida, 1];
    for (let i = 1; i < ent.length; i++) {
      if (linear <= ent[i]) {
        const f = (linear - ent[i - 1]) / Math.max(ent[i] - ent[i - 1], 1e-9);
        return sai[i - 1] + f * (sai[i] - sai[i - 1]);
      }
    }
    // Acima do topo da régua a angularidade satura em 1. O salto dos picos
    // não vem daqui: vem do envelope, medido em oitavas sobre a base (abaixo).
    return 1;
  }

  quadro() {
    const N = this.N, re = new Float32Array(N), im = new Float32Array(N);
    // desenrola o buffer circular: a amostra mais antiga primeiro
    for (let i = 0; i < N; i++) this.trecho[i] = this.buffer[(this.escrita + i) % N];
    for (let i = 0; i < N; i++) re[i] = this.trecho[i] * this.janelaHann[i];
    fft(re, im);

    const mag = new Float32Array(N / 2);      // energia por raia
    for (let k = 0; k < N / 2; k++) mag[k] = re[k] * re[k] + im[k] * im[k];

    const soma = r => { let s = 0; for (let k = r.a; k <= r.b; k++) s += mag[k]; return s; };
    const centroide = r => {
      let num = 0, den = 0;
      for (let k = r.a; k <= r.b; k++) { num += mag[k] * k * this.binHz; den += mag[k]; }
      return den > 1e-20 ? num / den : 0;
    };

    const Eg = soma(this.rGrave), Em = soma(this.rMedio);
    // proporção de cada sub-região dentro da sua faixa: soma 1
    const proporcoes = (subs, total) => {
      const v = subs.map(r => soma(r) / Math.max(total, 1e-20));
      const s2 = v.reduce((a, b) => a + b, 0) || 1;
      return v.map(x => x / s2);
    };
    // Suavizar as proporções e renormalizar, para a torção girar em vez de
    // piscar. Um tempo só: aqui não há acento a preservar, é forma sustentada.
    const tSub = this.c.suavizacao.subRegioes;
    const suavizarSub = (guardado, alvo) => {
      if (!guardado) return alvo.slice();
      const v = guardado.map((x, i) =>
        umPolo(x, alvo[i], this.dt, tSub, tSub));
      const t = v.reduce((a2, b2) => a2 + b2, 0) || 1;
      return v.map(x => x / t);
    };
    this.subG = suavizarSub(this.subG, proporcoes(this.subGrave, Eg));
    this.subM = suavizarSub(this.subM, proporcoes(this.subMedio, Em));
    const subG = this.subG, subM = this.subM;
    const cg = centroide(this.rGrave), cm = centroide(this.rMedio);

    // Fluxo espectral positivo só nos graves, e quantas raias subiram junto.
    let fluxo = 0, subiram = 0;
    for (let k = this.rGrave.a; k <= this.rGrave.b; k++) {
      const d = Math.sqrt(mag[k]) - Math.sqrt(this.magAnterior[k]);
      if (d > 0) { fluxo += d; subiram++; }
    }
    const fracaoSubiu = subiram / this.rGrave.n;
    this.magAnterior.set(mag.subarray(0, N / 2));

    // --- as três travas do detector de ataque ---
    this.histFluxo.push(fluxo);
    const nBase = Math.round(this.c.ataque.janelaBaseSeg / this.dt);
    if (this.histFluxo.length > nBase) this.histFluxo.shift();
    const media = this.histFluxo.reduce((a, b) => a + b, 0) / this.histFluxo.length;
    const desvio = Math.sqrt(this.histFluxo.reduce((a, b) => a + (b - media) ** 2, 0) / this.histFluxo.length);
    const novidade = fluxo > media + this.c.ataque.kLimiar * desvio;
    const juntas   = fracaoSubiu >= this.c.ataque.fracaoBandas;
    const livre    = (this.t - this.tUltimoAtaque) >= this.c.ataque.refratarioMs / 1000;
    let ataque = null;
    if (novidade && juntas && livre && this.histFluxo.length > 8) {
      this.tUltimoAtaque = this.t;
      ataque = { t: this.t, forca: Math.min(1, fluxo / Math.max(media + 4 * desvio, 1e-9)) };
    }

    // --- suavização, sobe rápido e desce devagar ---
    const sv = this.c.suavizacao;
    const egDb = dB(Eg), emDb = dB(Em);
    if (!this.iniciado) { this.s = { eg: egDb, em: emDb, bg: cg || 100, bm: cm || 1000 }; this.iniciado = true; }
    else if (this.s.eg < -85) { this.s.eg = egDb; this.s.em = emDb; }   // energia ainda não semeada
    this.s.eg = umPolo(this.s.eg, egDb, this.dt, sv.energiaGraveSubida, sv.energiaGraveDescida);
    this.s.em = umPolo(this.s.em, emDb, this.dt, sv.energiaMedioSubida, sv.energiaMedioDescida);

    // --- piso de silêncio e confiança ---
    // Abaixo do piso o centroide é uma divisão por quase nada: vira ruído.
    // Nesse caso a leitura SEGURA o último valor válido. Zero de energia não
    // quer dizer brilho zero, quer dizer brilho desconhecido (PRD, seção 4).
    // Ancoragem: junta as primeiras leituras reais e desloca a semente até a
    // mediana delas. Sem isso a forma compara o som com uma régua que não é
    // dele e fica presa num extremo enquanto a janela não se renova.
    if (this.ancorar > 0) {
      this.amostraG.push(egDb); this.amostraM.push(emDb);
      if (--this.ancorar === 0) {
        const med = a => { const v = a.slice().sort((x, y) => x - y); return v[Math.floor(v.length / 2)]; };
        const dG = med(this.amostraG), dM = med(this.amostraM);
        for (let i = 0; i < this.histEg.length; i++) { this.histEg[i] += dG; this.histEm[i] += dM; }
        // Nenhum deslocamento é aplicado. A passagem prévia e a reprodução
        // medem igual desde que o volume de escuta saiu do caminho da leitura
        // (medido: -1,7 dB no grave, 0,0 no médio-agudo). Qualquer correção
        // estimada nos primeiros segundos seria pior que o descasamento, porque
        // o começo da faixa não representa a faixa. O valor fica só no relatório.
        this.port.postMessage({ tipo: 'descasamento',
          grave: this.reguaX ? this.reguaX.medianaGrave - dG : 0,
          medio: this.reguaX ? this.reguaX.medianaMedio - dM : 0 });
        this.port.postMessage({ tipo: 'ancorado', grave: dG, medio: dM });
      }
    }
    this.histEg.push(egDb); this.histEm.push(emDb);
    if (this.histEg.length > this.nJanela) { this.histEg.shift(); this.histEm.shift(); }
    const nz = this.c.normalizacao;
    const conf = (db, hist) => {
      const topo = percentil(hist, 0.95), piso = topo - nz.faixaDinamicaDb;
      return Math.min(1, Math.max(0, (db - piso) / nz.margemConfiancaDb));
    };
    const confG = conf(egDb, this.histEg), confM = conf(emDb, this.histEm);
    if (confG > 0 && cg > 0) {
      this.s.bg = 2 ** umPolo(Math.log2(this.s.bg), Math.log2(cg), this.dt, sv.brilhoSubida, sv.brilhoDescida);
      this.r.bg = 2 ** umPolo(Math.log2(this.r.bg), Math.log2(cg), this.dt, sv.brilhoPicoSubida, sv.brilhoDescida);
    }
    if (confM > 0 && cm > 0) {
      this.s.bm = 2 ** umPolo(Math.log2(this.s.bm), Math.log2(cm), this.dt, sv.brilhoSubida, sv.brilhoDescida);
      this.r.bm = 2 ** umPolo(Math.log2(this.r.bm), Math.log2(cm), this.dt, sv.brilhoPicoSubida, sv.brilhoDescida);
    }

    // --- escala móvel: 0 a 1 conforme os últimos segundos ---
    // Eixo x na régua ABSOLUTA compartilhada: as duas formas leem a mesma
    // régua de energia, então a faixa mais forte fica mais larga na tela.
    // Normalizar dentro de cada faixa — como era antes — apagava a diferença
    // entre elas e deixava as duas formas sempre da mesma largura.
    const naReguaX = (db, banda) => {
      const R = this.reguaX;
      const x = Math.min(1, Math.max(0,
        (db + this.desloc[banda] - R.lo) / Math.max(R.hi - R.lo, 1e-6)));
      const ent = [0, ...R.entrada, 1], sai = [0, ...R.saida, 1];
      for (let i = 1; i < ent.length; i++) {
        if (x <= ent[i]) {
          const f = (x - ent[i - 1]) / Math.max(ent[i] - ent[i - 1], 1e-9);
          return sai[i - 1] + f * (sai[i] - sai[i - 1]);
        }
      }
      return 1;
    };
    const escala = (db, hist, banda) => {
      if (this.ancorar > 0) return 0.5;     // ainda sem régua confiável
      if (this.reguaX) return naReguaX(db, banda);
      if (hist.length < 10) return 0;       // sem calibração: janela móvel
      const lo = percentil(hist, 0.05), hi = percentil(hist, 0.95);
      return Math.min(1, Math.max(0, (db - lo) / Math.max(hi - lo, 1e-9)));
    };
    // dB em relação ao mais forte dos últimos segundos: 0 dB é o pico recente.
    // Em absoluto o número não quer dizer nada (depende do ganho da entrada).
    const relativo = (db, hist) => hist.length < 10 ? 0 : db - percentil(hist, 0.95);

    // Angularidade final = posição na régua + envelope do pico de brilho.
    //
    // O pico NÃO é medido pela distância a um teto fixo. Medido assim, um
    // gritinho de 3.482 Hz transbordava 1,35 e um de 2.994 Hz só 1,06, embora
    // os dois sejam o mesmo evento musical — e os do meio da faixa sumiam.
    // Medido como SALTO sobre o que estava soando, todo gritinho deste áudio
    // tem o mesmo tamanho: de 0,97 a 1,11 oitava. Medido em 21/09.
    const A = this.c.angularidade;
    // Orçamento de transbordo de cada forma: a distância até a próxima região
    // ocupada da régua, ou até o fim dela. Sai da calibração, não de gosto.
    const sai = A.expansao.saida;
    const folga = { grave: Math.max(0, sai[2] - sai[1]),
                    medio: Math.max(0, 1 - sai[3]) };
    const tauBase = Math.exp(-this.dt / (A.baseBrilhoMs / 1000));
    const comEnvelope = (nome, hz, bruta) => {
      const L = Math.log2(Math.max(hz, 1));
      this.base[nome] = this.base[nome] ? tauBase * this.base[nome] + (1 - tauBase) * L : L;
      const salto = L - this.base[nome];                       // em oitavas
      const forca = Math.min(1, Math.max(0,
        (salto - A.picoLimiarOitavas) / Math.max(A.picoRefOitavas - A.picoLimiarOitavas, 1e-6)));
      const queda = Math.exp(-this.dt / (A.transbordoQuedaMs / 1000));
      this.pico[nome] = Math.max(forca, this.pico[nome] * queda);
      return Math.min(bruta, 1) + this.pico[nome] * folga[nome] * A.transbordoDaFolga;
    };
    // o pico lê o brilho rápido; a geometria, o lento
    const angG = comEnvelope('grave', this.r.bg, this.angularidade(this.s.bg));
    const angM = comEnvelope('medio', this.r.bm, this.angularidade(this.s.bm));

    this.quadros++;
    this.port.postMessage({
      tipo: 'leitura', t: this.t, quadros: this.quadros,
      grave: { db: relativo(this.s.eg, this.histEg), dbAbsoluto: this.s.eg,
               nivel: escala(this.s.eg, this.histEg, 'grave'), brilhoHz: this.s.bg,
               confianca: confG, angularidade: angG, pico: this.pico.grave, sub: subG },
      medio: { db: relativo(this.s.em, this.histEm), dbAbsoluto: this.s.em,
               nivel: escala(this.s.em, this.histEm, 'medio'), brilhoHz: this.s.bm,
               confianca: confM, angularidade: angM, pico: this.pico.medio, sub: subM },
      fluxo, fracaoSubiu, ataque
    });
    this.t += this.dt;
  }

  process(entradas) {
    const canal = entradas[0] && entradas[0][0];
    if (!canal) return true;
    for (let i = 0; i < canal.length; i++) {
      this.buffer[this.escrita] = canal[i];
      this.escrita = (this.escrita + 1) % this.N;
      if (this.preenchido < this.N) this.preenchido++;
      if (++this.desdeUltimo >= this.H && this.preenchido >= this.N) {
        this.desdeUltimo = 0;
        this.quadro();
      }
    }
    return true;
  }
}
registerProcessor('leitura', Leitura);
