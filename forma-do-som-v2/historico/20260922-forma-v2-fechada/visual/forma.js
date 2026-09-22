// As duas formas. Geometria do PDF da autora, "comportamento da forma".
//
//  eixo x  = amplitude   — quanto mais forte, mais a forma se distribui
//                          pelas extremidades do eixo x (pág. 3)
//  eixo y  = brilho      — som escuro se acumula no centro, som brilhante
//                          vai para as extremidades do eixo y (pág. 4)
//  pontas  = angularidade — contínuo entre sem ponta e pontuda. O círculo e o
//                          triângulo da pág. 5 são as duas pontas da escala,
//                          não duas formas (PRD 4.4, seção 5)
//
// O centro de cada forma nunca se desloca: ela se expande e se recolhe
// em torno dele, nos dois sentidos de cada eixo.

globalThis.Formas = (() => {
  const M = 240;   // quantos pontos do contorno são calculados

  // Contorno: o corpo é SEMPRE uma elipse; as pontas entram como relevo por cima.
  //
  // A versão anterior interpolava a silhueta inteira entre elipse e polígono, o
  // que misturava duas coisas diferentes: quanto o corpo é redondo (global) e
  // quão afiada é cada ponta (local). No grave saía um borrão globalmente
  // triangular em vez de um corpo redondo com pequenos picos; no agudo, um
  // polígono de vértices moles. Separado em 20/09/2026, a pedido da autora.
  //
  //   relevo  = o quanto a ponta sai do corpo
  //   nitidez = a curva da ponta: 1 é um morro largo, 10 é um pico estreito
  //
  // Os dois crescem com a angularidade medida, lida na régua compartilhada.
  // Como a forma grave vive na parte baixa da régua e a média-aguda na alta,
  // uma fica com picos macios e a outra com pontas afiadas, sem que isso
  // precise ser declarado por forma.
  // Quanto o contorno desvia da media NAQUELE PONTO da volta (PRD, secao 6, P7).
  //
  //   'simetrica'  - nao desvia; nenhuma assimetria existe
  //   'ornamento'  - variacao fixa por faixa, derivada da calibracao. Fica
  //                  organica e NAO codifica nada; tem de ser declarado
  //   'medida'     - as tres sub-regioes da faixa sao distribuidas ao longo da
  //                  volta: um lado da forma responde ao terco grave da faixa,
  //                  outro ao medio, outro ao agudo. A assimetria passa a
  //                  significar a desigualdade interna do som
  //
  // Tudo em funcao da FASE continua, nao do indice da ponta. Indexar por ponta
  // (ponta % 3) fazia o padrao se repetir a cada tres pontas e impunha uma
  // simetria de tres dobras em vez de quebrar a simetria. Corrigido em 21/09.
  function desvio(fase, cfg, sub) {
    const A = cfg.__assimetria;
    if (!A || A.modo === 'simetrica') return 1;
    const s = ((fase % 1) + 1) % 1;
    if (A.modo === 'ornamento') {
      const v = 0.6 * Math.sin(2 * Math.PI * (s + 0.11 * A.semente))
              + 0.4 * Math.sin(2 * Math.PI * (2.7 * s + 0.37 * A.semente));
      return 1 + A.forca * v;
    }
    if (A.modo === 'medida' && sub && sub.length === 3) {
      const x = s * 3, i = Math.floor(x), f = x - i;
      const p0 = sub[i % 3] * 3, p1 = sub[(i + 1) % 3] * 3;
      const suave = f * f * (3 - 2 * f);
      return 1 + A.forca * ((p0 + (p1 - p0) * suave) - 1);
    }
    return 1;
  }

  function contorno(ctx, cx, cy, a, b, relevo, nitidez, N, giro, porPerimetro, pelaNormal, cfg, sub) {
    // O relevo é somado em medida absoluta, não multiplicado pelo raio.
    // Multiplicando, numa forma alta e estreita os lobos laterais somem
    // (o raio ali é pequeno) e só as pontas de cima e de baixo aparecem.
    const escala = Math.sqrt(a * b);

    // Onde cada ponta cai. Distribuir por ÂNGULO amontoa as pontas nos
    // extremos do eixo menor quando a forma é achatada: ângulo igual não é
    // distância igual numa elipse. Por PERÍMETRO elas ficam espalhadas por
    // toda a volta, que é o comportamento pedido. Corrigido em 20/09/2026.
    const fase = new Float64Array(M + 1);
    if (porPerimetro) {
      let acum = 0;
      const px = th => a * Math.cos(th), py = th => b * Math.sin(th);
      let xa = px(0), ya = py(0);
      for (let i = 1; i <= M; i++) {
        const th = i / M * Math.PI * 2, xb = px(th), yb = py(th);
        acum += Math.hypot(xb - xa, yb - ya);
        fase[i] = acum; xa = xb; ya = yb;
      }
      const total = acum || 1;
      for (let i = 0; i <= M; i++) fase[i] /= total;      // 0 a 1 ao longo da volta
      // desloca para que uma ponta caia no topo
      const iTopo = Math.round(M * 0.75);                  // no canvas, topo = 3/4 da volta
      const sTopo = fase[iTopo];
      for (let i = 0; i <= M; i++) fase[i] = fase[i] - sTopo;
    } else {
      for (let i = 0; i <= M; i++) fase[i] = (i / M) + giro / (Math.PI * 2);
    }

    // Dois vocabulários possíveis para a ponta, escolhidos na configuração:
    //   'lobo'     — morro de cosseno, base larga, a forma fica ondulada
    //   'espicula' — agulha de base larga que afina até a ponta, como as
    //                espículas de radiolária. A nitidez estreita a agulha.
    // Nenhuma fonte diz como a forma deve parecer: F14 prende só a direção
    // (mais brilho, mais pontudo). O vocabulário é decisão de projeto.
    const esp = cfg && cfg.espicula;
    const usarEspicula = cfg && cfg.perfil === 'espicula';
    const larg = usarEspicula ? esp.larguraMax - (esp.larguraMax - esp.larguraMin) * cfg.__ang : 0;
    const afun = usarEspicula ? esp.afunilaMin + (esp.afunilaMax - esp.afunilaMin) * cfg.__ang : 1;
    // quanto a ponta é bico e quanto é morro: 0 arredondada, 1 afiada
    const kBico = usarEspicula ? Math.min(1, Math.max(0,
      (cfg.__ang - esp.bicoDe) / Math.max(esp.bicoAte - esp.bicoDe, 1e-6))) : 0;

    ctx.beginPath();
    for (let i = 0; i <= M; i++) {
      const th = i / M * Math.PI * 2;
      // O desvio entra no relevo E no corpo: sem tocar o corpo, a massa segue
      // uma elipse perfeita e a forma continua parecendo simetrica.
      const dv = desvio(fase[i], cfg, sub);
      const corpo = 1 + (dv - 1) * ((cfg.__assimetria && cfg.__assimetria.noCorpo) || 0);
      let d;
      if (usarEspicula) {
        const q = fase[i] * N, u = q - Math.round(q);        // posição dentro da agulha
        // O FORMATO da ponta também depende da angularidade. Só o tamanho
        // dependia, e a tenda termina em bico por construção: a forma grave
        // ficava com agulhas curtas em vez de ondulações. Agora interpola
        // entre morro de cosseno (derivada zero na ponta, arredondado) e
        // agulha (bico). Corrigido em 21/09 a pedido da autora.
        const dentro = Math.min(1, Math.abs(u) / larg);
        const bico  = (1 - dentro) ** afun;
        const morro = Math.cos(dentro * Math.PI / 2) ** 2;
        const agulha = (1 - kBico) * morro + kBico * bico;
        // Segunda escala, fina, que dá o aspecto de organismo. Amarrada à
        // angularidade: sem isso ela fica na mesma escala das pontas da forma
        // grave e não dá mais para contá-las. Assim o grave sai liso e
        // ondulado, o agudo espinhoso e texturizado, e a diferença cresce.
        const fino = Math.abs(Math.cos(esp.pontasFinas * Math.PI * fase[i])) ** 3;
        d = escala * (relevo * dv * esp.ganho * (agulha - 0.18)
                    + relevo * esp.detalhe * cfg.__ang * (fino - 0.5));
      } else {
        const lobo = Math.abs(Math.cos(N * Math.PI * fase[i])) ** nitidez;
        d = escala * relevo * (lobo - 0.5);
      }
      // A ponta sai pela NORMAL do contorno, não pelo raio. Pelo raio, nas
      // pontas do eixo maior a direção é quase horizontal: o relevo estica o
      // comprimento em vez de formar um pico, e os picos só aparecem no meio.
      // Pela normal, o pico sobe perpendicular à borda em qualquer lugar dela.
      const px = a * corpo * Math.cos(th), py = b * corpo * Math.sin(th);
      let nx, ny;
      if (pelaNormal) { nx = b * Math.cos(th); ny = a * Math.sin(th); }
      else            { nx = px; ny = py; }            // versão antiga: pelo raio
      const n = Math.hypot(nx, ny) || 1; nx /= n; ny /= n;
      const x = cx + px + nx * d, y = cy + py + ny * d;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
  }

  // Envelope do acento: sobe em 25 ms, cai em 220 ms (PRD, seção 6).
  function acento(t, ataques, cfg) {
    const s = cfg.acento.subidaMs / 1000, q = cfg.acento.quedaMs / 1000;
    let maior = 0;
    for (let i = ataques.length - 1; i >= 0; i--) {
      const idade = t - ataques[i].t;
      if (idade < 0) continue;
      if (idade > q) break;
      const e = idade < s ? idade / s : Math.max(0, 1 - (idade - s) / (q - s)) ** 2;
      maior = Math.max(maior, e * ataques[i].forca);
    }
    return maior;
  }

  function desenhar(ctx, leitura, ataques, cfg) {
    const P = cfg.palco, F = cfg.formas;
    ctx.fillStyle = P.fundo;
    ctx.fillRect(0, 0, P.largura, P.altura);
    if (!leitura) return null;

    const emp = acento(leitura.t, ataques, cfg);
    const medidas = {};

    // Ordem de desenho. Com o mesmo cinza e sem vão ela não muda a imagem;
    // passa a importar quando a forma de cima abre um vão do fundo (abaixo).
    const ordem = (P.ordem === 'grave-por-cima')
      ? ['medioAgudo', 'grave'] : ['grave', 'medioAgudo'];
    for (const nome of ordem) {
      const f = F[nome];
      const d = leitura[nome === 'grave' ? 'grave' : 'medio'];
      const empurrao = nome === 'grave' ? emp * f.ganhoAcento : 0;

      // x pela energia da faixa. O acento é somado DEPOIS do teto, não antes:
      // metade dos ataques chega com a forma já em 1,00, e somar antes do
      // limite jogava o empurrão fora justamente no instante da batida.
      // Um impacto é exceção e passa do teto, como o pico de brilho.
      const faixa = f.xMax - f.xMin;
      const a = f.xMin + faixa * Math.min(1, d.nivel) + faixa * empurrao;

      // y pelo brilho, lido na MESMA régua absoluta compartilhada que move as
      // pontas — nunca normalizado dentro de cada faixa. Normalizar por faixa
      // faria a forma grave subir às extremidades do eixo y tanto quanto a
      // média-aguda, que é a mesma inversão proibida na angularidade.
      // A excursão do eixo y é menor que a das pontas porque aqui o descritor
      // é substituto e a simetria não tem fonte (PRD, seção 5).
      const b = f.yMin + (f.yMax - f.yMin) * Math.min(1, d.angularidade)
              + (f.yMax - f.yMin) * empurrao * 0.6;

      // relevo e nitidez saem da MESMA angularidade e dos MESMOS limites para
      // as duas formas: nada aqui é normalizado por faixa.
      const R = cfg.relevo;
      // A curva não é reta: o expoente segura o relevo na parte baixa da régua,
      // onde vive a forma grave, sem achatar a parte alta. Assim a grave fica
      // com ondulações rasas e a média-aguda mantém as agulhas.
      const relevo  = R.min + (R.max - R.min) * Math.pow(Math.max(0, d.angularidade), R.curva);
      const nitidez = R.nitidezMin + (R.nitidezMax - R.nitidezMin) * d.angularidade;

      R.__ang = d.angularidade;
      R.__assimetria = cfg.assimetria;
      contorno(ctx, f.centroX * P.largura, f.centroY * P.altura, a, b,
               relevo, nitidez, f.pontas, f.giro,
               R.distribuicao !== 'angulo', R.direcao !== 'raio', R, d.sub);
      // A forma de cima abre um vão da cor do FUNDO em volta de si, e só
      // depois se preenche. É assim que ela aparece à frente sem as duas
      // precisarem de cinzas diferentes: quem marca a profundidade é o vão,
      // não um valor novo. O canal de luminosidade fica livre para a cor.
      if (P.vaoDeSobreposicao > 0 && nome === ordem[ordem.length - 1]) {
        ctx.strokeStyle = P.fundo;
        ctx.lineWidth = P.vaoDeSobreposicao;
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
      ctx.fillStyle = f.cor || P.forma;
      ctx.globalAlpha = (f.opacidade === undefined) ? 1 : f.opacidade;
      ctx.fill();
      ctx.globalAlpha = 1;
      medidas[nome] = { a, b, ang: d.angularidade, relevo, nitidez, empurrao };
    }
    return medidas;
  }

  return { desenhar, acento };
})();
