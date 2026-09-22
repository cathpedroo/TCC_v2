// Configuração do protótipo v2 — "A forma do som"
// Todo valor ajustável do sistema mora aqui. Mude, salve, recarregue a página.
// Regra do PRD (seção 7): o que o som pode determinar, o som determina.
// Isto aqui não são controles de tela: é a calibração do sistema.

globalThis.CONFIG = {

  // ---------- captura ----------
  // Janela de 2048 amostras (~46 ms a 44,1 kHz) e salto de 1024 (~23 ms).
  // Dá ~43 leituras por segundo. Janela curta reage rápido a ataque
  // e resolve mal os graves: é o preço aceito (PRD, seção 4).
  janela: 2048,
  salto: 1024,

  // Filtro na entrada, contra ruído de mesa e manuseio.
  // NÃO usar 55 Hz como o StrumSurfer: o Fá1 de 44,3 Hz é a nota mais grave
  // do trecho depois dos 22 s, e sumiria. 30 Hz é o piso da faixa grave.
  passaAltaHz: 30,

  // ---------- as duas faixas ----------
  faixaGrave:      { min:  30, max:  220 },   // a forma dos ataques
  faixaMedioAgudo: { min: 350, max: 6000 },   // a forma da leitura sustentada

  // ---------- suavização, em milissegundos ----------
  // Sobe rápido e desce devagar, como o StrumSurfer (subida 18–22 por segundo,
  // descida 2,2–3,2). Aqui em tempo: a descida é o número do PRD (140 e 180 ms),
  // a subida é mais curta para o gesto não chegar atrasado.
  suavizacao: {
    // A energia tem tempos DIFERENTES para cada forma, e a razão é de desenho:
    //   grave — corpo lento, porque quem dá o pulso é o acento (25/220 ms).
    //           Com 140 ms o corpo pulsava junto com cada nota e a largura
    //           saltava 25% entre leituras.
    //   média-aguda — corpo rápido, porque ela NÃO tem acento nenhum. É a
    //           leitura sustentada: se o corpo também for lento, ela perde
    //           qualquer sincronia com o som. Erro cometido em 20/09, quando
    //           a lentidão do grave foi aplicada às duas.
    energiaGraveSubida:  120, energiaGraveDescida:  700,
    energiaMedioSubida:   45, energiaMedioDescida:  190,
    // Subida do brilho baixada de 60 para 15 ms em 20/09. Medido no áudio:
    // a faixa média-aguda tem picos de brilho a cada ~1 s, em que o centroide
    // pula de 1.449 para ~2.920 Hz. Com 60 ms de subida só 59% do pico chegava
    // à tela; com 15 ms chegam 93%. As pontas saltam rápido e recolhem devagar.
    // brilhoSubida move a GEOMETRIA: subiu de 15 para 90 ms em 21/09, porque
    // com 15 ms a forma perseguia cada oscilação do centroide e tremia.
    // brilhoPicoSubida move só o DETECTOR DE PICO, que precisa ser rápido.
    brilhoSubida:   90,  brilhoPicoSubida: 15,  brilhoDescida: 180,
    // As três sub-regiões (assimetria MEDIDA, P7) saíam cruas do worklet, as
    // únicas medidas do caminho sem suavização nenhuma. Medido em 22/09, no
    // trecho de 13 a 25 s: a proporção da sub-região grave superior pula de
    // 0,36 para 0,92 em meio segundo. Sem filtro a torção da forma pisca em
    // vez de girar — é a mesma razão de brilhoSubida ter subido para 90 ms.
    subRegioes: 170
  },

  // ---------- detector de ataque (três travas juntas) ----------
  ataque: {
    janelaBaseSeg: 2.0,    // sobre quanto tempo se mede a média e o desvio
    kLimiar:       1.8,    // quantos desvios acima da média conta como novidade
    fracaoBandas:  0.15,   // 15% das raias da faixa precisam subir no mesmo salto
    refratarioMs:  110     // depois de um ataque, ninguém entra por este tempo
  },

  // ---------- acento (ainda não desenha nada na etapa 1) ----------
  acento: { subidaMs: 25, quedaMs: 220 },

  // ---------- escala móvel e piso de silêncio ----------
  // Ao vivo não se conhece o futuro: a escala vem dos últimos segundos.
  // Medido em 18/09: para este áudio, a diferença para a escala do arquivo
  // inteiro foi de 0,06 numa escala de 0 a 1.
  normalizacao: {
    janelaSeg:        3.0,
    faixaDinamicaDb:  45,  // abaixo disto em relação ao mais forte recente, é silêncio
    margemConfiancaDb: 6,  // quantos dB acima do piso até a leitura valer inteira
    // A passagem prévia e a reprodução devem medir igual. Se ficarem mais
    // apartadas que isto, a régua é deslocada; abaixo disso, fica como está.
    // Com os dois caminhos corrigidos a diferença medida é de 0,3 dB.
    descasamentoMinimoDb: 2.0
  },

  // ---------- régua da angularidade ----------
  // Régua ABSOLUTA e compartilhada pelas duas formas: a mesma frequência dá
  // sempre a mesma angularidade. Nunca normalizar por faixa — inverteria F14
  // (um grave de 170 Hz ficaria tão pontudo quanto um agudo de 2.913 Hz).
  // A expansão estica as duas janelas realmente ocupadas e comprime o vão:
  // sem ela, a angularidade anda só 0,20 e quase não se vê (PRD 4.4, seção 5).
  // Os quatro pontos de entrada vêm da calibração. Os abaixo foram medidos
  // no audio-prototipo.mp3 e precisam ser remedidos para outra gravação.
  angularidade: {
    reguaMinHz: 55, reguaMaxHz: 2913,
    // Quanto um pico de brilho transborda o teto da PRÓPRIA forma.
    // Não é mais um valor absoluto. Medido em 22/09: somado de forma fixa
    // (+0,45 para as duas), o transbordo valia 1,7 vez a janela inteira do
    // grave (0,05–0,32) e 1,4 vez a da média-aguda (0,45–0,78) — o mesmo
    // bônus pesando diferente. O grave passava do próprio teto em 22% dos
    // quadros com som, chegava a 0,77 (o teto NORMAL da outra forma) e ficava
    // mais pontudo que ela em 2% deles, o que a seção 5 do PRD diz que não
    // acontece. As duas bandas saltam quase o mesmo em oitavas (p90 de 0,54 e
    // 0,44), então o limiar não estava errado: a soma é que era grande demais
    // para a janela do grave.
    // Regra nova, uma só para as duas: o transbordo gasta no máximo a
    // distância até a próxima região ocupada da régua — ou até o fim dela, se
    // não houver nenhuma acima. O pico alcança a fronteira da outra forma e
    // nunca a cruza. Neste áudio: 0,13 para o grave, 0,22 para a média-aguda.
    // 1,0 gasta a folga inteira num pico cheio; 0 desliga o transbordo.
    transbordoDaFolga: 1.0,
    // O pico de brilho é medido como SALTO sobre o que estava soando, não
    // como altura absoluta. `baseBrilhoMs` é a memória dessa base; o salto é
    // medido em oitavas acima dela. Medido neste áudio: todo gritinho salta
    // entre 0,97 e 1,11 oitava, do começo ao fim da faixa.
    baseBrilhoMs: 1500,
    picoLimiarOitavas: 0.45,   // abaixo disto não conta como pico
    picoRefOitavas:    0.95,   // aqui o pico é máximo
    // O transbordo tem envelope próprio: sobe na hora e cai neste tempo.
    // É a mesma lógica do acento dos graves — um salto é evento, com subida
    // e queda, não um valor que acompanha o som para cima e para baixo.
    transbordoQuedaMs: 280,
    expansao: {
      entrada: [0.02, 0.24, 0.75, 0.92],   // onde cada faixa está na régua linear
      // A janela da forma média-aguda foi baixada de 0,62–0,97 para 0,45–0,78
      // em 20/09: com a base tão pontuda, o pico de brilho não se destacava.
      // Agora o corriqueiro é moderadamente pontudo e o pico é evento.
      saida:   [0.05, 0.32, 0.45, 0.78]
    }
  },

  // ---------- as pontas ----------
  // O corpo é sempre uma elipse. As pontas são relevo por cima dele.
  // Estes quatro números valem para AS DUAS formas: são os extremos da régua
  // compartilhada. Como cada forma ocupa um trecho diferente da régua, uma sai
  // com picos macios e a outra com pontas afiadas — sem normalizar por faixa.
  relevo: {
    min: 0.03, max: 0.30,          // o quanto a ponta sai do corpo
    curva: 1.7,                    // >1 segura o relevo embaixo da régua
    nitidezMin: 1.0, nitidezMax: 6.0, // 1 é morro largo, 6 é pico estreito
    // 'perimetro' espalha as pontas por toda a volta; 'angulo' é a versão
    // antiga, que as amontoava nos extremos do eixo menor. Fica disponível
    // só para comparação.
    distribuicao: 'perimetro',
    // 'normal' faz o pico sair perpendicular à borda; 'raio' é a versão antiga,
    // que nas extremidades do eixo maior esticava o comprimento em vez de
    // formar pico. Também só para comparação.
    direcao: 'normal',
    // Quantas pontas cada forma tem. NÃO é escolhido à mão: sai de onde a
    // faixa vive na régua compartilhada, medido pela calibração.
    //   pontas = arredonda(pontasMin + (pontasMax - pontasMin) × posição na régua)
    // Mais pontas e pontas mais afiadas empurram a mesma qualidade — frequência
    // espacial alta no contorno (F18, p. 2646) —, então as duas andam juntas e
    // na direção que F14 mede. A contagem em si não foi medida por nenhuma
    // fonte: é propositiva, declarada.
    // É calculada uma vez por faixa, na calibração, e não muda durante a
    // reprodução: contagem é número inteiro e mudaria aos saltos.
    // Piso em 5, não 3: com 4 pontas e o vértice no topo, as pontas da forma
    // grave caíam exatamente nos eixos da elipse e ela lia como um losango.
    pontasMin: 5, pontasMax: 9,

    // Vocabulário da ponta: 'lobo' (morro largo, forma ondulada) ou
    // 'espicula' (agulha de base larga afinando até a ponta, como radiolária).
    // Decisão de projeto: nenhuma fonte descreve a aparência da forma.
    perfil: 'espicula',
    espicula: {
      larguraMin: 0.14, larguraMax: 0.36,  // largura angular da agulha; a
                                           // nitidez medida estreita a agulha
      afunilaMin: 0.9,  afunilaMax: 1.8,   // curva do afunilamento
      ganho: 2.4,                          // agulha é estreita: precisa sair mais
      // Onde a ponta deixa de ser morro arredondado e vira bico afiado.
      // Abaixo de bicoDe é toda arredondada; acima de bicoAte, toda afiada.
      // A forma grave vive em ~0,05-0,32 na régua, então sai ondulada; a
      // média-aguda em ~0,45-0,78, então sai com ponta.
      bicoDe: 0.38, bicoAte: 0.72,
      detalhe: 0.60, pontasFinas: 17,      // segunda escala, fina, multiplicada
                                           // pela angularidade: o grave quase não a tem
    }
  },

  // ---------- assimetria das pontas (pendência P7) ----------
  // 'simetrica' — todas as pontas iguais. Nada na medida pede simetria: ela
  //               vem do desenho, porque cada forma recebe três escalares e
  //               escalar não tem lado.
  // 'ornamento' — variação fixa, derivada da calibração da faixa. Fica
  //               orgânica e é repetível, mas NÃO codifica nada: se entrar,
  //               o texto precisa dizer que a variação entre pontas é
  //               decorativa.
  // 'medida'    — cada terço do contorno é modulado por uma sub-região da
  //               faixa. A assimetria passa a significar a desigualdade
  //               interna do som. Propositivo, mas medido. Limite a respeitar:
  //               três números por forma é medida; o espectro inteiro seria
  //               um mostrador em coordenadas polares, que a seção 2 exclui.
  // noCorpo: quanto do desvio entra no raio da elipse, alem das pontas.
  // Sem isso a massa da forma continua simetrica e so o relevo muda.
  assimetria: { modo: 'medida', forca: 0.70, semente: 1, noCorpo: 0.5 },

  // ---------- composição das duas formas no palco ----------
  // Onde cada forma fica não é medida do som: é decisão de composição
  // (pendência P3, decidida em 21/09). Duas disposições, alternáveis na tela
  // para comparar — como "silenciar uma forma", é escolha de quem assiste,
  // não ajuste de parâmetro.
  composicao: {
    atual: 'separadas',
    separadas:   { graveX: 0.38, graveY: 0.50, medioX: 0.62, medioY: 0.50,
                   ordem: 'aguda-por-cima', vao: 0 },
    // mesmo centro, grave desenhada por cima, com vão do fundo em volta dela
    sobrepostas: { graveX: 0.50, graveY: 0.50, medioX: 0.50, medioY: 0.50,
                   ordem: 'grave-por-cima', vao: 14 }
  },

  // ---------- as duas formas ----------
  // Medidas em pixels do palco lógico de 1920 x 1080.
  // Onde cada forma fica é decisão de composição da autora (pendência P3),
  // não medida do som: por isso mora aqui e não em controle de tela.
  formas: {
    grave: {
      centroX: 0.38, centroY: 0.5,     // escrito pela composição, acima
      xMin: 60, xMax: 170,             // extensão pela energia (eixo x). Baixado de
                                       // 340 em 20/09: com 340 a forma era sempre
                                       // mais larga que alta e o eixo y não aparecia
      yMin: 40, yMax: 162,             // extensão pelo brilho (eixo y) — 162 px
                                       // é 30% da meia-altura: excursão menor
                                       // porque no eixo y o descritor é substituto
      angularidadeMin: 0.05, angularidadeMax: 0.40,  // onde esta forma vive na régua;
                                       // escrito pela calibração, mostrado no painel
      pontas: 4, giro: Math.PI / 2,    // valor de partida; a calibração reescreve
      ganhoAcento: 0.45                // quanto o ataque empurra
    },
    medioAgudo: {
      centroX: 0.62, centroY: 0.5,
      xMin: 60, xMax: 170,
      yMin: 40, yMax: 162,
      angularidadeMin: 0.62, angularidadeMax: 0.97,
      pontas: 8, giro: Math.PI / 2,    // valor de partida; a calibração reescreve
      ganhoAcento: 0
    }
  },

  // ---------- palco ----------
  palco: { largura: 1920, altura: 1080, fundo: '#101312', forma: '#cccccc' },

  // ---------- entrada ----------
  arquivoAudio: '../audio/audio-prototipo.mp3',
  ganhoArquivo: 0.80,
  ganhoMicrofone: 1.05
};
