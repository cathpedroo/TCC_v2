// O painel de leitura: os números no lugar dos controles.
// Mostra a medida AO LADO do que ela causaria na tela. É o que permite dizer
// "esse trecho apagou porque o brilho caiu" (PRD, seção 7).
// Na etapa 1 nenhuma forma é desenhada: a coluna "causa" é o valor calculado,
// não algo que já esteja aparecendo.

globalThis.Painel = (() => {
  const $ = id => document.getElementById(id);
  let ultimo = null, ataques = 0, tUltimoAtaque = null, pintarAgendado = false;

  const num = (v, casas = 0) => v.toLocaleString('pt-BR',
    { minimumFractionDigits: casas, maximumFractionDigits: casas });
  const pct = v => num(v * 100) + '%';

  function rotuloConfianca(c) {
    if (c >= 0.99) return { texto: 'alta', classe: '' };
    if (c > 0)     return { texto: 'parcial', classe: 'parcial' };
    return { texto: 'indisponível', classe: 'sem-confianca' };
  }

  // Três colunas: medida, valor, causa. Com cinco a tabela estourava o painel.
  function bloco(forma, faixa, d) {
    const c = rotuloConfianca(d.confianca);
    const semBrilho = d.confianca === 0;
    return `
      <tr class="secao"><th colspan="3">${forma} <small>${faixa}</small></th></tr>
      <tr><td>energia</td>
        <td class="n">${num(d.db, 1)} dB<small>do pico recente</small></td>
        <td class="causa">extensão x: <b>${pct(d.nivel)}</b></td></tr>
      <tr><td>brilho <small>centroide</small></td>
        <td class="n">${semBrilho ? '<i>abaixo do piso</i>' : num(d.brilhoHz) + ' Hz'}
          <small class="${c.classe}">confiança ${c.texto}</small></td>
        <td class="causa">${semBrilho
            ? 'segurando <b>' + num(d.brilhoHz) + ' Hz</b>'
            : 'angularidade: <b>' + num(d.angularidade, 2) + '</b>'}</td></tr>`;
  }

  function pintar() {
    pintarAgendado = false;
    if (!ultimo) return;
    const d = ultimo;
    const trava = d.fracaoSubiu >= globalThis.CONFIG.ataque.fracaoBandas;
    $('tabela-leitura').innerHTML =
      bloco('grave', '30–220 Hz', d.grave) +
      bloco('médio-aguda', '350–6.000 Hz', d.medio) +
      `<tr class="secao"><th colspan="3">ataques <small>na faixa grave</small></th></tr>
       <tr><td>fluxo</td>
         <td class="n">${num(d.fluxo, 1)}
           <small class="${trava ? '' : 'parcial'}">${num(d.fracaoSubiu * 100)}% das raias subiram</small></td>
         <td class="causa"><b>${ataques}</b> no total${tUltimoAtaque !== null
           ? '<small>último há ' + num(d.t - tUltimoAtaque, 1) + ' s</small>' : ''}</td></tr>`;
    // Posição NA FAIXA vem do player. O relógio do worklet conta o tempo que
    // ele processou, que é outra coisa: depois de buscar, os dois divergem.
    const player = document.getElementById('audio');
    const posicao = (player && player.src && !isNaN(player.currentTime)) ? player.currentTime : d.t;
    $('relogio-leitura').textContent = num(posicao, 1) + ' s';
    $('contagem-quadros').textContent = d.quadros + ' leituras';
  }

  function receber(d) {
    ultimo = d;
    if (d.ataque) { ataques++; tUltimoAtaque = d.ataque.t; }
    // A leitura chega ~43x por segundo; a tela é pintada no ritmo dela,
    // não no da leitura. Medir e desenhar são coisas separadas.
    if (!pintarAgendado) { pintarAgendado = true; requestAnimationFrame(pintar); }
  }

  function zerar() { ultimo = null; ataques = 0; tUltimoAtaque = null; }

  return { receber, zerar, ultimo: () => ultimo, totalAtaques: () => ataques };
})();
