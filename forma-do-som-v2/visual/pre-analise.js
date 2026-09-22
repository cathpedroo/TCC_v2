// Passagem prévia: lê a faixa inteira ANTES de desenhar, para calibrar as escalas.
//
// Isto só é possível no modo arquivo. Ao vivo não se conhece o futuro, e a
// calibração tem de vir de alguém tocando antes (PRD, seção 4). Aqui a faixa
// já está inteira na mão, então ela calibra a si mesma.
//
// O que NÃO muda: a leitura. A passagem prévia roda o MESMO worklet, num
// contexto offline mais rápido que o tempo real. Um caminho de código só.

globalThis.PreAnalise = (() => {

  const percentil = (arr, p) => {
    const v = arr.slice().sort((a, b) => a - b);
    return v[Math.min(v.length - 1, Math.max(0, Math.round(p * (v.length - 1))))];
  };

  async function analisar(arrayBuffer, aoProgredir = () => {}) {
    const cfg = globalThis.CONFIG;
    // decodifica em mono, na taxa do arquivo
    const ctxTmp = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
    const buffer = await ctxTmp.decodeAudioData(arrayBuffer.slice(0));
    await ctxTmp.close();

    const off = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);
    await off.audioWorklet.addModule('leitura-worklet.js');
    const fonte = off.createBufferSource();
    fonte.buffer = buffer;
    const filtro = off.createBiquadFilter();
    filtro.type = 'highpass'; filtro.frequency.value = cfg.passaAltaHz;
    const no = new AudioWorkletNode(off, 'leitura', {
      numberOfInputs: 1, numberOfOutputs: 0,
      // mono explícito: ao vivo o nó recebia 2 canais e o worklet lia só o
      // esquerdo, enquanto aqui a mistura já vinha somada. Era parte dos
      // 7,6 dB que separavam as duas medições.
      channelCount: 1, channelCountMode: 'explicit', channelInterpretation: 'speakers',
      processorOptions: { config: cfg }
    });
    // mesmo ganho de entrada da reprodução, senão as escalas não batem
    const ganhoPrevio = off.createGain();
    ganhoPrevio.gain.value = cfg.ganhoArquivo;
    const leituras = [];
    no.port.onmessage = e => {
      if (e.data.tipo !== 'leitura') return;
      leituras.push(e.data);
      if (leituras.length % 200 === 0) aoProgredir(leituras.length);
    };
    fonte.connect(ganhoPrevio).connect(filtro).connect(no);
    // um caminho silencioso até a saída, para o contexto offline renderizar
    const mudo = off.createGain(); mudo.gain.value = 0;
    fonte.connect(mudo).connect(off.destination);
    fonte.start();
    await off.startRendering();
    await new Promise(r => setTimeout(r, 0));   // deixa as mensagens chegarem

    if (leituras.length < 20) throw new Error('A faixa é curta demais para calibrar.');
    return calibrar(leituras, buffer, cfg);
  }

  function calibrar(leituras, buffer, cfg) {
    const L = Math.log2;
    const A = cfg.angularidade;
    const naRegua = hz => Math.min(1, Math.max(0,
      (L(Math.max(hz, 1)) - L(A.reguaMinHz)) / (L(A.reguaMaxHz) - L(A.reguaMinHz))));

    // Só os quadros com som: abaixo do piso o brilho é ruído (PRD, seção 4).
    const dbG = leituras.map(l => l.grave.dbAbsoluto);
    const dbM = leituras.map(l => l.medio.dbAbsoluto);
    const pisoG = percentil(dbG, 0.95) - cfg.normalizacao.faixaDinamicaDb;
    const pisoM = percentil(dbM, 0.95) - cfg.normalizacao.faixaDinamicaDb;
    const comSom = leituras.filter((l, i) => dbG[i] > pisoG && dbM[i] > pisoM);
    const usar = comSom.length > 20 ? comSom : leituras;

    const brilhoG = usar.map(l => l.grave.brilhoHz).filter(v => v > 0);
    const brilhoM = usar.map(l => l.medio.brilhoHz).filter(v => v > 0);

    // As quatro entradas da expansão: onde cada faixa realmente está na régua.
    const entrada = [
      naRegua(percentil(brilhoG, 0.05)), naRegua(percentil(brilhoG, 0.95)),
      naRegua(percentil(brilhoM, 0.05)), naRegua(percentil(brilhoM, 0.95))
    ];
    // Se as janelas se encostarem, mantém uma folga mínima para as formas
    // não trocarem de lado (aceite, critério 10).
    if (entrada[2] - entrada[1] < 0.02) entrada[2] = entrada[1] + 0.02;

    // Quantas pontas cada forma tem: sai de onde a faixa está na régua.
    const R = cfg.relevo, sai = A.expansao.saida;
    const contar = (a, b) => Math.round(R.pontasMin + (R.pontasMax - R.pontasMin) * (a + b) / 2);

    // Régua ABSOLUTA compartilhada do eixo x, construída como a da angularidade.
    // Sem ela cada forma media a energia contra o próprio alcance, as duas
    // ficavam sempre na mesma largura, e a diferença real entre as faixas
    // (8 dB nesta gravação) não aparecia na tela.
    const rg = [percentil(dbG, 0.05), percentil(dbG, 0.95)];
    const rm = [percentil(dbM, 0.05), percentil(dbM, 0.95)];
    const lo = Math.min(rg[0], rm[0]), hi = Math.max(rg[1], rm[1]);
    const naReguaX = db => Math.min(1, Math.max(0, (db - lo) / Math.max(hi - lo, 1e-6)));
    const pts = [naReguaX(rg[0]), naReguaX(rg[1]), naReguaX(rm[0]), naReguaX(rm[1])]
                  .slice().sort((a, b) => a - b);
    // as duas janelas ocupadas esticam; o vão entre elas comprime
    const saidaX = [0.08, 0.42, 0.58, 0.96];

    return {
      reguaX: { lo, hi, entrada: pts, saida: saidaX,
                medianaGrave: percentil(dbG, 0.5), medianaMedio: percentil(dbM, 0.5) },
      // medianas do brilho, para o detector de pico já nascer calibrado:
      // sem isso a base começa no primeiro valor lido e os primeiros segundos
      // não têm salto em relação a nada.
      // Amostra real da distribuição de energia, para semear a janela móvel.
      // Uma rampa entre p5 e p95 supõe distribuição uniforme, que o som não
      // tem: nos primeiros segundos a escala mapeava errado.
      amostraGrave: Array.from({length: 129}, (_, i) => percentil(dbG, i / 128)),
      amostraMedio: Array.from({length: 129}, (_, i) => percentil(dbM, i / 128)),
      brilhoGraveMediana: percentil(brilhoG, 0.5),
      brilhoMedioMediana: percentil(brilhoM, 0.5),
      pontasGrave: contar(sai[0], sai[1]),
      pontasMedio: contar(sai[2], sai[3]),
      duracao: buffer.duration,
      taxaAmostragem: buffer.sampleRate,
      leituras: leituras.length,
      brilhoGrave: [percentil(brilhoG, 0.05), percentil(brilhoG, 0.95)],
      brilhoMedio: [percentil(brilhoM, 0.05), percentil(brilhoM, 0.95)],
      energiaGrave: [percentil(dbG, 0.05), percentil(dbG, 0.95)],
      energiaMedio: [percentil(dbM, 0.05), percentil(dbM, 0.95)],
      pisoGrave: pisoG, pisoMedio: pisoM,
      ataques: leituras.filter(l => l.ataque).length,
      expansao: { entrada, saida: A.expansao.saida.slice() }
    };
  }

  return { analisar };
})();
