// Liga a entrada de som à leitura do worklet.
// Duas entradas, um caminho só: microfone e arquivo passam pelo MESMO código.
// É o que dá ao modo arquivo o papel de versão repetível e conferível (PRD, seção 4).

globalThis.LeituraSonora = (() => {
  let ctx = null, no = null, fonte = null, elementoAudio = null, ganho = null, fonteArquivo = null;
  let ganhoEscuta = null, volumeEscuta = 0.6, mudo = false;
  let aoLer = () => {}, aoPronto = () => {};

  // O navegador só libera som depois de um gesto da pessoa: o motor precisa
  // nascer ou ser retomado DENTRO do clique (PRD, seção 4).
  let preparando = null;
  async function motor() {
    // Guarda contra chamadas simultâneas: dois cliques rápidos no play
    // criariam o contexto duas vezes e o nó nasceria antes do módulo carregar.
    if (!preparando) {
      preparando = (async () => {
        if (!ctx) {
          ctx = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
          await ctx.audioWorklet.addModule('leitura-worklet.js');
        }
      })();
    }
    await preparando;
    if (ctx.state === 'suspended') await ctx.resume();
    return ctx;
  }

  function criarNo() {
    if (no) return no;
    no = new AudioWorkletNode(ctx, 'leitura', {
      numberOfInputs: 1, numberOfOutputs: 0,
      // mono explícito, igual à passagem prévia (ver pre-analise.js)
      channelCount: 1, channelCountMode: 'explicit', channelInterpretation: 'speakers',
      processorOptions: { config: globalThis.CONFIG, semente: globalThis.SEMENTE || null }
    });
    no.port.onmessage = e => {
      if (e.data.tipo === 'leitura') aoLer(e.data);
      else if (e.data.tipo === 'pronto') aoPronto(e.data);
    };
    return no;
  }

  // Passa-alta em 30 Hz. Não 55 Hz: cortaria o Fá1 de 44,3 Hz deste material.
  function passaAlta() {
    const f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = globalThis.CONFIG.passaAltaHz;
    return f;
  }

  async function usarArquivo(url, audioEl) {
    await motor();
    desligar();
    // O elemento de áudio só aceita ser conectado UMA vez: criar um segundo
    // MediaElementSource sobre ele lança erro. Guarda e reaproveita, senão
    // subir um segundo arquivo quebra a página.
    if (elementoAudio !== audioEl) {
      elementoAudio = audioEl;
      fonteArquivo = ctx.createMediaElementSource(audioEl);
      // O volume do elemento entra no sinal que sai do MediaElementSource, e
      // com ele entrava na LEITURA: com a escuta em 60% a análise vinha 4,5 dB
      // mais baixa que a da passagem prévia. O elemento fica sempre em 1 e a
      // escuta é controlada por um ganho só no caminho das caixas.
      audioEl.volume = 1;
      ganhoEscuta = ctx.createGain();
      ganhoEscuta.gain.value = mudo ? 0 : volumeEscuta;
      fonteArquivo.connect(ganhoEscuta).connect(ctx.destination);
    }
    fonte = fonteArquivo;
    ganho = ctx.createGain();
    ganho.gain.value = globalThis.CONFIG.ganhoArquivo;
    // A leitura recebe o som filtrado; a escuta sai pelas caixas em paralelo.
    fonte.connect(ganho).connect(passaAlta()).connect(criarNo());
    return ctx;
  }

  async function usarMicrofone() {
    await motor();
    desligar();
    // Os três recursos do navegador desligados: senão ele achata a dinâmica
    // antes de o protótipo medir.
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
    });
    fonte = ctx.createMediaStreamSource(stream);
    ganho = ctx.createGain();
    ganho.gain.value = globalThis.CONFIG.ganhoMicrofone;
    // O microfone NUNCA vai para as caixas: microfonia.
    fonte.connect(ganho).connect(passaAlta()).connect(criarNo());
    return ctx;
  }

  function desligar() {
    if (!fonte) return;
    try { fonte.disconnect(); } catch {}
    // o arquivo continua ligado às caixas; só a leitura foi desfeita
    if (fonte === fonteArquivo && ganhoEscuta) { try { fonte.connect(ganhoEscuta); } catch {} }
    fonte = null;
  }

  // Volume de escuta: só o caminho das caixas, nunca o da leitura.
  // O elemento <audio> fica SEMPRE em volume 1 e nunca em muted. Qualquer
  // atenuação feita nele acontece antes do MediaElementSource e entraria na
  // medida — foi assim que o silenciar zerou a leitura inteira (20/09).
  // Silêncio e volume moram os dois no ganho de escuta, depois da derivação.
  function aplicarGanho() {
    if (ganhoEscuta) ganhoEscuta.gain.value = mudo ? 0 : volumeEscuta;
    if (elementoAudio) { elementoAudio.volume = 1; elementoAudio.muted = false; }
  }
  function escutar(v) { volumeEscuta = v; aplicarGanho(); }
  function silenciar(s) { mudo = !!s; aplicarGanho(); }

  // Depois de calibrar, o nó precisa nascer de novo: a configuração vai
  // para o worklet no momento em que ele é criado.
  function recalibrar() { if (no) { try { no.disconnect(); } catch {} no.port.onmessage = null; no = null; } }

  return {
    usarArquivo, usarMicrofone, desligar, recalibrar, escutar, silenciar,
    aoLer:    fn => { aoLer = fn; },
    aoPronto: fn => { aoPronto = fn; },
    contexto: () => ctx
  };
})();
