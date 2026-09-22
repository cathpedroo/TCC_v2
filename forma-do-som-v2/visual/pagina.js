// Liga os botões da página à leitura e ao desenho.
(() => {
  const $ = id => document.getElementById(id);
  const audio = $('audio'), cfg = globalThis.CONFIG;
  const tela = $('tela'), pincel = tela.getContext('2d');
  let ligado = false, ataques = [], urlAtual = null, calibrado = false;

  const msg = t => { $('mensagem').textContent = t || ''; };
  const num = (v, c = 0) => v.toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c });
  const mmss = s => {
    const m = Math.floor(s / 60), r = s - m * 60;
    return String(m).padStart(2, '0') + ':' + r.toFixed(1).padStart(4, '0').replace('.', ',');
  };
  const progresso = el => el.style.setProperty('--progresso',
    (el.value - el.min) / Math.max(el.max - el.min, 1e-9) * 100 + '%');

  globalThis.LeituraSonora.escutar(Number($('volume').value));

  // ---------- painel ----------
  $('alternar-painel').onclick = () => {
    const aberto = $('painel').hasAttribute('hidden');
    $('painel').toggleAttribute('hidden', !aberto);
    $('alternar-painel').setAttribute('aria-expanded', String(aberto));
  };
  $('fechar-painel').onclick = () => {
    $('painel').setAttribute('hidden', '');
    $('alternar-painel').setAttribute('aria-expanded', 'false');
  };

  // ---------- leitura ----------
  globalThis.LeituraSonora.aoPronto(d => {
    $('dados-captura').innerHTML = `
      <div><dt>taxa de leitura</dt><dd>${d.taxaLeitura.toFixed(1)} /s</dd></div>
      <div><dt>largura de cada raia</dt><dd>${d.binHz.toFixed(1)} Hz</dd></div>
      <div><dt>raias na faixa grave</dt><dd>${d.raiasGrave}</dd></div>
      <div><dt>raias na faixa média-aguda</dt><dd>${d.raiasMedio}</dd></div>
      <div><dt>trava de ataque</dt><dd>${Math.ceil(d.raiasGrave * cfg.ataque.fracaoBandas)} de ${d.raiasGrave} raias</dd></div>`;
  });
  globalThis.LeituraSonora.aoLer(d => {
    globalThis.Painel.receber(d);
    if (d.ataque) {
      ataques.push(d.ataque);
      if (ataques.length > 60) ataques.shift();
    }
  });

  // ---------- desenho ----------
  // A leitura mede a ~43/s; a tela pinta no ritmo dela. Coisas separadas.
  function pintar() {
    globalThis.Formas.desenhar(pincel, globalThis.Painel.ultimo(), ataques, cfg);
    requestAnimationFrame(pintar);
  }
  requestAnimationFrame(pintar);

  // ---------- receber a faixa ----------
  async function receberArquivo(file) {
    try {
      $('aviso-campo').hidden = true;
      $('nome-faixa').textContent = file.name;
      msg('Lendo a faixa inteira para calibrar…');
      $('estado-calibracao').textContent = 'lendo…';
      audio.pause(); ligado = false; ataques = [];
      globalThis.Painel.zerar(); globalThis.LeituraSonora.recalibrar();

      const bytes = await file.arrayBuffer();
      const cal = await globalThis.PreAnalise.analisar(bytes,
        n => { $('estado-calibracao').textContent = num(n) + ' leituras…'; });
      aplicarCalibracao(cal);

      if (urlAtual) URL.revokeObjectURL(urlAtual);
      urlAtual = URL.createObjectURL(file);
      audio.src = urlAtual;
      msg('Calibrado. Reproduza para ver as formas.');
    } catch (e) {
      msg('Não consegui ler a faixa: ' + e.message);
      $('estado-calibracao').textContent = 'falhou';
      $('aviso-campo').hidden = false;
    }
  }

  // A calibração escreve a régua e as janelas de cada forma. Não é ajuste
  // de gosto: é onde o brilho daquele material realmente está.
  function aplicarCalibracao(c) {
    cfg.angularidade.expansao.entrada = c.expansao.entrada;
    const s = c.expansao.saida;
    cfg.formas.grave.angularidadeMin = s[0];
    cfg.formas.grave.angularidadeMax = s[1];
    cfg.formas.medioAgudo.angularidadeMin = s[2];
    cfg.formas.medioAgudo.angularidadeMax = s[3];
    cfg.formas.grave.pontas = c.pontasGrave;
    cfg.formas.medioAgudo.pontas = c.pontasMedio;
    // a escala móvel começa já calibrada, sem os segundos de aquecimento
    globalThis.SEMENTE = { grave: c.energiaGrave, medio: c.energiaMedio,
                           amostraGrave: c.amostraGrave, amostraMedio: c.amostraMedio,
                           brilhoGrave: c.brilhoGraveMediana, brilhoMedio: c.brilhoMedioMediana,
                           reguaX: c.reguaX };
    calibrado = true;
    $('estado-calibracao').textContent = num(c.leituras) + ' leituras · ' + num(c.duracao, 1) + ' s';
    $('dados-calibracao').innerHTML = `
      <div><dt>brilho da faixa grave</dt><dd>${num(c.brilhoGrave[0])} – ${num(c.brilhoGrave[1])} Hz</dd></div>
      <div><dt>brilho da faixa média-aguda</dt><dd>${num(c.brilhoMedio[0])} – ${num(c.brilhoMedio[1])} Hz</dd></div>
      <div><dt>angularidade da forma grave</dt><dd>${num(s[0], 2)} – ${num(s[1], 2)}</dd></div>
      <div><dt>angularidade da média-aguda</dt><dd>${num(s[2], 2)} – ${num(s[3], 2)}</dd></div>
      <div><dt>folga entre as duas</dt><dd>${num(s[2] - s[1], 2)}</dd></div>
      <div><dt>pontas de cada forma</dt><dd>${c.pontasGrave} · ${c.pontasMedio}</dd></div>
      <div><dt>energia na régua do eixo x</dt><dd>${num(c.reguaX.entrada[2],2)}–${num(c.reguaX.entrada[3],2)} · ${num(c.reguaX.entrada[0],2)}–${num(c.reguaX.entrada[1],2)}</dd></div>
      <div><dt>ataques na faixa inteira</dt><dd>${c.ataques} · ${num(c.ataques / c.duracao, 1)}/s</dd></div>`;
  }

  // Salva o quadro do instante atual em protótipo_v2/figuras/.
  async function salvarQuadro() {
    const t = audio.currentTime.toFixed(1).replace('.', ',');
    const nome = (($('nome-faixa').textContent || 'faixa').replace(/\.[^.]+$/, '')) + '_' + t + 's';
    const blob = await new Promise(r => tela.toBlob(r, 'image/png'));
    try {
      const r = await fetch('/figura', { method: 'POST', headers: { 'X-Nome': nome }, body: blob });
      msg(r.ok ? 'Quadro salvo em figuras/' + nome + '.png' : 'Não consegui salvar o quadro.');
    } catch (e) { msg('Não consegui salvar o quadro: ' + e.message); }
  }
  globalThis.salvarQuadro = salvarQuadro;
  $('salvar-quadro').onclick = salvarQuadro;

  // Disposição das duas formas: comparação, não ajuste. A sobreposição com
  // valores diferentes ficou adiada para depois da cor (PRD, seção 6).
  function aplicarComposicao(qual) {
    const c = cfg.composicao[qual];
    if (!c) return;
    cfg.composicao.atual = qual;
    cfg.formas.grave.centroX = c.graveX;      cfg.formas.grave.centroY = c.graveY;
    cfg.formas.medioAgudo.centroX = c.medioX; cfg.formas.medioAgudo.centroY = c.medioY;
    cfg.palco.ordem = c.ordem;
    cfg.palco.vaoDeSobreposicao = c.vao;
    for (const b of document.querySelectorAll('#composicao button'))
      b.setAttribute('aria-pressed', String(b.dataset.composicao === qual));
    $('nota-composicao').textContent = qual === 'separadas'
      ? 'Cada forma no seu lugar, próximas mas legíveis.'
      : 'Mesmo centro, a grave à frente. Ela abre um vão do fundo ao cruzar a outra.';
  }
  for (const b of document.querySelectorAll('#composicao button'))
    b.onclick = () => aplicarComposicao(b.dataset.composicao);
  aplicarComposicao(cfg.composicao.atual);

  // Simetria do contorno (pendência P7). Trocável na tela porque é comparação,
  // não ajuste: as três opções desenham a MESMA leitura de três maneiras.
  const notasAssimetria = {
    simetrica: 'Todas as pontas iguais. Nada na medida pede simetria — ela vem do desenho, '
             + 'porque cada forma recebe três escalares e escalar não tem lado.',
    ornamento: 'Variação fixa, repetível, derivada da calibração da faixa. Fica orgânica, '
             + 'mas é decorativa: não codifica nada.',
    medida:    'Cada terço da volta responde a uma sub-região da banda. A torção gira '
             + 'conforme a energia se desloca dentro dela.'
  };
  function aplicarAssimetria(modo, forca) {
    if (modo) cfg.assimetria.modo = modo;
    if (forca != null) cfg.assimetria.forca = forca;
    const m = cfg.assimetria.modo, inerte = m === 'simetrica';
    for (const b of document.querySelectorAll('#assimetria button'))
      b.setAttribute('aria-pressed', String(b.dataset.assimetria === m));
    $('nota-assimetria').textContent = notasAssimetria[m] || '';
    $('forca-assimetria').disabled = inerte;
    $('linha-forca').style.opacity = inerte ? '.35' : '1';
    $('valor-forca').textContent = cfg.assimetria.forca.toFixed(2).replace('.', ',');
  }
  for (const b of document.querySelectorAll('#assimetria button'))
    b.onclick = () => aplicarAssimetria(b.dataset.assimetria, null);
  $('forca-assimetria').oninput = e => aplicarAssimetria(null, parseFloat(e.target.value));
  $('forca-assimetria').value = cfg.assimetria.forca;
  aplicarAssimetria(cfg.assimetria.modo, null);

  $('arquivo').onchange = e => { if (e.target.files[0]) receberArquivo(e.target.files[0]); };
  $('usar-exemplo').onclick = async () => {
    try {
      msg('Buscando o áudio do protótipo…');
      const r = await fetch(cfg.arquivoAudio);
      if (!r.ok) throw new Error('não encontrei o arquivo na pasta');
      const b = await r.blob();
      await receberArquivo(new File([b], 'audio-prototipo.mp3', { type: b.type || 'audio/mpeg' }));
    } catch (e) { msg('Erro: ' + e.message); }
  };

  // arrastar e soltar
  let arrastando = 0;
  addEventListener('dragenter', e => { e.preventDefault(); if (++arrastando === 1) $('alvo-arraste').hidden = false; });
  addEventListener('dragover', e => e.preventDefault());
  addEventListener('dragleave', () => { if (--arrastando <= 0) { arrastando = 0; $('alvo-arraste').hidden = true; } });
  addEventListener('drop', e => {
    e.preventDefault(); arrastando = 0; $('alvo-arraste').hidden = true;
    const f = [...(e.dataTransfer?.files || [])].find(f => f.type.startsWith('audio') || /\.(mp3|wav|m4a|ogg|flac)$/i.test(f.name));
    if (f) receberArquivo(f); else msg('Isso não parece um arquivo de áudio.');
  });

  // ---------- transporte ----------
  $('tocar').onclick = async () => {
    if (!audio.src) { msg('Escolha uma faixa primeiro.'); return; }
    try {
      if (audio.paused) {
        // O motor de áudio nasce ou é retomado DENTRO do clique.
        if (!ligado) { await globalThis.LeituraSonora.usarArquivo(audio.src, audio); ligado = true; }
        await audio.play();
      } else audio.pause();
    } catch (e) { msg('Erro: ' + e.message); }
  };
  $('recomecar').onclick = () => { audio.currentTime = 0; ataques = []; globalThis.Painel.zerar(); };
  // Silenciar corta as caixas, não a medida: vai no ganho de escuta, nunca
  // em audio.muted, que fica antes da derivação para o worklet.
  let mudo = false;
  $('mudo').onclick = () => {
    mudo = !mudo;
    globalThis.LeituraSonora.silenciar(mudo);
    $('mudo').setAttribute('aria-pressed', String(mudo));
    $('icone-som').toggleAttribute('hidden', mudo);
    $('icone-mudo').toggleAttribute('hidden', !mudo);
  };
  $('volume').oninput = e => {
    // vai para o ganho de escuta, não para o elemento: o volume do elemento
    // entraria na leitura (ver leitura.js)
    globalThis.LeituraSonora.escutar(Number(e.target.value));
    $('valor-volume').textContent = Math.round(e.target.value * 100) + '%';
    progresso(e.target);
  };
  $('posicao').oninput = e => { audio.currentTime = Number(e.target.value); ataques = []; progresso(e.target); };

  audio.onloadedmetadata = () => {
    $('posicao').max = audio.duration;
    $('duracao').textContent = mmss(audio.duration);
    $('recomecar').disabled = false;
  };
  audio.ontimeupdate = () => {
    $('tempo').textContent = mmss(audio.currentTime);
    $('posicao').value = audio.currentTime; progresso($('posicao'));
  };
  const icones = t => {
    $('icone-play').toggleAttribute('hidden', t);
    $('icone-pause').toggleAttribute('hidden', !t);
    $('tocar').setAttribute('aria-label', t ? 'Pausar' : 'Reproduzir');
  };
  audio.onplay = () => { icones(true); msg(''); };
  audio.onpause = () => icones(false);
  progresso($('volume'));
})();
