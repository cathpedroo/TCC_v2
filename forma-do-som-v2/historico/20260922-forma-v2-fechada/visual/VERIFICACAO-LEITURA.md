# Conferência da etapa 1 — subir a faixa, ler e desenhar

20/09/2026. Página em `protótipo_v2/visual/`, aberta por `servir.py` na porta 8675.

A etapa mudou a pedido da autora: em vez de começar sem forma nenhuma, começa **completa no modo arquivo** — sobe-se uma faixa, a página lê a faixa inteira para se calibrar, e as duas formas são desenhadas. O microfone fica para depois.

## O que foi conferido, e com que resultado

| conferência | esperado | medido na página | |
|---|---|---|---|
| taxa de leitura | ~43 /s (salto de 1024 a 44,1 kHz) | **43,1 /s** | ✓ |
| brilho da faixa média-aguda | mediana offline de 1.509 Hz, faixa 855–2.913 | **1.364 a 1.493 Hz** nos trechos amostrados | ✓ |
| ataques | ~1,6 por segundo | **12 em 9,3 s = 1,3/s** | ✓ |
| corte dos 22 s | grave sobe, brilho cai | ver abaixo | ✓ |
| formas não trocam de lado | angularidade grave sempre abaixo da média-aguda | 0,43 < 0,73 e 0,12 < 0,60 | ✓ |
| folga entre as angularidades | acima de 0,15 (aceite, critério 11) | 0,30 e 0,48 | ✓ |

### O corte dos 22 s aparece

| medida | em 20,0 s | em 34,0 s |
|---|---|---|
| energia grave | −12,5 dB | **−4,8 dB** |
| extensão x da forma grave | 33% | **76%** |
| brilho médio-agudo | 1.326 Hz | **915 Hz** |
| angularidade média-aguda | 0,73 | **0,60** |

Na direção medida offline em 18/09 (grave sobe ~10 dB, brilho cai). Os números não são idênticos porque estes são instantes únicos com escala móvel de 3 s, e os offline eram medianas de metades do trecho.

## Três coisas que a etapa 1 descobriu

**1. A faixa grave tem só 9 raias, e isso enfraquece a trava de ataque.**
Com janela de 2.048 a 44,1 kHz, cada raia vale 21,5 Hz. A faixa de 30 a 220 Hz cabe em **9 raias**; a média-aguda em 262. A trava dos 15% vira "pelo menos 2 de 9 raias subindo juntas", enquanto no StrumSurfer, com janela de 8.192, a mesma faixa teria ~35 raias e a trava era exigente de verdade.

Não é defeito: é a consequência direta da janela curta que o PRD escolheu para reagir rápido ao ataque. Mas precisa constar no texto, e há uma saída conhecida se os ataques falsos incomodarem — a do StrumSurfer: detectar *quando* com janela curta e medir *o quê* com janela longa, em duas resoluções. Fica como possibilidade, não como mudança já feita.

**2. O dB absoluto não quer dizer nada.** A primeira versão mostrava "45,8 dB", que depende do ganho da entrada e não se compara com nada. Agora o painel mostra o dB **em relação ao pico dos últimos 3 segundos**: 0 dB é o mais forte recente. É o mesmo referencial das medições offline.

**3. O relógio do worklet não é a posição na faixa.** Ele conta quanto som já processou, o que serve para medir a idade de cada acento, mas diverge do player assim que se busca um trecho. O painel passou a mostrar a posição do player; o relógio interno ficou só para o envelope do acento.

**4. O buffer precisava ser circular.** A primeira versão empurrava o array inteiro a cada amostra — 90 milhões de operações por segundo, e o áudio engasgaria. Trocado por um buffer circular, que só desenrola na hora de calcular o quadro.

## As formas, conferidas no par do corte

Quadros salvos pela própria página em `protótipo_v2/figuras/`.

| | 20,7 s | 35,0 s |
|---|---|---|
| energia grave | −11,6 dB | **−0,2 dB** |
| extensão x da forma grave | 35% | **98%** |
| angularidade grave | 0,32 | 0,18 |
| brilho médio-agudo | 2.050 Hz | **822 Hz** |
| angularidade média-aguda | 0,90 | 0,60 |

Na tela: antes do corte a forma grave é uma elipse pequena e a média-aguda um triângulo alto e pontudo; depois do corte a grave se espalha quase por inteiro no eixo x e continua redonda, e a média-aguda encolhe e perde ponta. As duas nunca trocam de lado: 0,32 < 0,90 e 0,18 < 0,60.

É o comportamento do PDF da autora, com as três páginas visíveis ao mesmo tempo: amplitude no eixo x (pág. 3), brilho no eixo y (pág. 4), e o contínuo entre círculo e triângulo (pág. 5).

## A calibração automática bate com a medição em Python

| | Python, 18/09 | página, 20/09 |
|---|---|---|
| leituras na faixa inteira | 1.689 | **1.689** |
| brilho da faixa grave (p5–p95) | 55 – 170 Hz | 62 – 172 Hz |
| brilho da faixa média-aguda | 855 – 2.913 Hz | 925 – 2.546 Hz |
| ataques | 62 · 1,6/s | 60 · 1,5/s |

A passagem prévia roda o **mesmo worklet** num contexto offline, mais rápido que o tempo real. Não há um segundo analisador para manter em pé.

## Um erro corrigido no caminho, que vale registrar

A primeira versão calculava a altura de cada forma normalizando o brilho **dentro de cada faixa**. O resultado: a forma grave ficava alta e estreita e a média-aguda baixa e larga — o oposto do PDF. É a mesma inversão que o PRD proíbe na angularidade, aplicada ao eixo y sem querer.

Corrigido: o eixo y lê a **mesma régua absoluta compartilhada** que move as pontas. A forma grave fica perto do centro porque o grave é grave, e a média-aguda sobe porque é aguda. Uma medida, uma régua, duas expressões.

## A geometria das pontas, refeita em 20/09

A autora apontou que a interpolação entre elipse e polígono misturava duas coisas: quanto o corpo é redondo (global) e quão afiada é cada ponta (local). Refeita: **o corpo é sempre uma elipse e as pontas são relevo por cima dela**, com `relevo` e `nitidez` crescendo com a angularidade medida, na mesma régua compartilhada.

Dois defeitos geométricos apareceram e foram corrigidos, nesta ordem:

1. **As pontas seguiam o ângulo, não o perímetro.** Numa forma achatada, ângulo igual não é distância igual: os picos se amontoavam nos extremos do eixo menor e sumiam nas laterais. Passaram a ser distribuídos por comprimento de arco.
2. **O relevo saía pelo raio, não pela normal do contorno.** Nas pontas do eixo maior a direção radial é quase horizontal, então o relevo esticava o comprimento em vez de formar pico — por isso, mesmo depois da primeira correção, os picos só apareciam no meio. Passou a sair perpendicular à borda, em qualquer ponto dela.

A comparação antes/depois está em `figuras/comparacao-antes-depois.png`, com a mesma leitura congelada nos quatro quadros. O modo antigo continua disponível em `config.js` (`relevo.distribuicao: 'angulo'`) só para comparação.

Também no mesmo dia: os centros das duas formas foram afastados de 0,33/0,67 para **0,27/0,73**, porque com as duas em energia cheia elas se encostavam. É decisão de composição (pendência P3), não medida.

## Ajuste de 20/09: o pico de brilho e dois bugs

**O "gritinho" da faixa média-aguda.** A autora ouviu um evento recorrente no `medio-agudo_350-6000Hz.wav` e perguntou se as pontas não podiam saltar nele. Medido: é **pico de brilho**, não ataque — o centroide vai de 1.449 para ~2.920 Hz com a energia no máximo, 33 vezes em 39,3 s, a cada 1,04 s.

A primeira tentativa foi acelerar a subida da suavização (60 → 15 ms). **Não resolveu**: mediana de 0,78 para 0,81 e tremor de 0,029 para 0,037. A causa real era que a régua, calibrada pelo percentil 95, tinha o teto na altura exata dos picos. Resolvido deixando a angularidade **transbordar** até 1,45 (PRD, seção 5).

Conferido depois: pico chega a 1,45, 8% dos quadros acima de 1, forma grave no máximo em 0,41 — sem cruzamento. Três quadros seguidos com 80 ms de intervalo deram 0,715 · 0,788 · 0,789: a forma respira, não vibra.

**Dois bugs encontrados ao medir, e corrigidos:**

1. **Subir um segundo arquivo quebrava a página.** Um elemento `<audio>` só aceita um `MediaElementSource` em toda a sua vida, e o código criava um novo a cada troca de faixa. Agora a fonte é guardada e reaproveitada. Teria aparecido na primeira troca de música.
2. **Dois cliques rápidos no play podiam criar o motor de áudio duas vezes**, e o nó nascia antes de o módulo do worklet carregar. `motor()` ganhou guarda contra chamadas simultâneas.

## Depuração de 20–21/09: três bugs de medição

Vieram todos da autora assistindo e apontando "está fora de ritmo". Nenhum apareceria em teste de número.

**1. O volume de escuta entrava na leitura.** O `MediaElementSource` carrega o `volume` do elemento de áudio, então a escuta em 60% fazia a análise chegar **4,5 dB** mais baixa que a da passagem prévia. A forma comparava o som com uma régua que não era dele e ficava presa num extremo nos primeiros segundos. O PRD dizia, na seção 7, que *"o volume de escuta não altera a leitura"* — e alterava. Corrigido: o elemento fica sempre em 1 e a escuta passou a ser um ganho só no caminho das caixas.

**2. A leitura ao vivo usava só o canal esquerdo.** A passagem prévia recebia a mistura dos dois canais e a reprodução entregava dois canais ao worklet, que lia apenas `entradas[0][0]`. Corrigido: `channelCount: 1` explícito nos dois caminhos. Junto com o item 1, o descasamento caiu de **7,6 dB para 0,3**.

**3. O corpo da forma pulsava com cada nota.** Com decaimento de 140 ms a largura saltava 25% entre leituras. Corrigido separando os tempos por forma: a grave ficou lenta (120/700 ms) porque quem dá o pulso nela é o acento; a média-aguda ficou rápida (45/190 ms) porque ela não tem acento nenhum. Aplicar a lentidão às duas — como foi feito primeiro — tirou toda a reação da média-aguda.

Também no caminho: o acento dos graves era somado **antes** do teto e metade dos ataques chegava com a forma já em 1,00, jogando o empurrão fora justamente no instante da batida; e a suavização do brilho foi desdobrada em duas, uma lenta para a geometria (90 ms) e uma rápida só para o detector de pico (15 ms), porque juntas obrigavam a escolher entre a forma tremer e o pico ser amortecido.

## O eixo x na régua compartilhada, 21/09

As duas formas tinham praticamente a mesma largura — mediana 144 contra 128 px — porque **a energia era normalizada dentro de cada faixa**. Cada forma media contra o próprio alcance, então as duas estavam sempre "na metade da sua escala" ao mesmo tempo, e a diferença real entre as faixas (8 dB nesta gravação) não chegava à tela.

É o mesmo erro já corrigido no eixo y e na angularidade, e o mesmo remédio: **régua absoluta compartilhada com expansão calibrada**, construída na passagem prévia. Depois:

| | p5 · mediana · p95 | amplitude |
|---|---|---|
| grave | 103 · **144** · 166 px | 63 px |
| média-aguda | 60 · **93** · 123 px | 63 px |

A grave é 51 px mais larga porque o grave é mais forte nesta gravação, e as duas mantêm a mesma amplitude de variação — nenhuma satura.

## Perfil da ponta, fechado em 21/09

A autora apontou, na tela, que a forma grave tinha agulhas curtas onde deveria ter ondulações. A causa era estrutural: a angularidade controlava só o tamanho da ponta, e o perfil de tenda termina em bico por construção.

Resolvido fazendo o **formato** também depender da régua — morro de cosseno abaixo de 0,38, agulha acima de 0,72 — e trocando a curva do relevo de reta para `angularidade^1,7`. Medido no instante que ela marcou (16,6 s): o relevo da forma grave caiu de 0,155 para 0,095, enquanto a média-aguda perdeu 0,05.

Valores aprovados e gravados em `config.js`: `bicoDe 0,38 · bicoAte 0,72 · relevo.curva 1,7 · espicula.larguraMax 0,36`.

## Composição, fechada em 21/09

Dez disposições geradas no mesmo instante e comparadas pela autora. Ficaram duas, alternáveis por botão: **separadas** (0,38 e 0,62) como padrão e **sobrepostas** no mesmo centro com a grave à frente.

A profundidade na sobreposição é marcada por um **vão da cor do fundo** de 14 px que a forma de cima abre em volta de si. Sem ele, com o mesmo cinza, a forma de baixo some por inteiro e a ordem de desenho não muda nada. Distinguir por valor foi recusado: criaria um canal que não mede nada e gastaria a luminosidade, reservada à valência.

**Erro no caminho:** o botão não funcionou no primeiro teste porque um script de edição falhou no meio e não gravou o bloco da ordem de desenho, deixando `ordem` indefinido — a tela ficou preta e eu só percebi olhando o console. Vale a lição: conferir o arquivo depois de cada edição, não só o código de retorno.

## O silenciar zerava a leitura, 22/09

O botão de silenciar fazia `audio.muted = true`. O mudo do elemento `<audio>`
acontece **antes** da derivação para o worklet, então as formas congelavam junto
com o som — a página deixava de medir enquanto parecia estar medindo. É o mesmo
erro do volume de escuta, corrigido em 20/09, reaparecendo em outro botão, e
desmentia a frase que a própria tela exibe: "o volume de escuta não altera a
leitura".

Corrigido movendo o silêncio para o `ganhoEscuta`, depois da derivação. O
elemento fica em `volume = 1` e `muted = false` sempre, e volume e silêncio
passaram a morar no mesmo nó. Conferido com o botão ligado: `audio.muted =
false`, leitura viva, sub-regiões e níveis normais.

**Lição que se repete:** toda atenuação feita no elemento entra na medida.
Controle novo de escuta vai para o ganho, nunca para o elemento.

## As sub-regiões saíam cruas, 22/09

As três proporções que alimentam a assimetria medida eram as únicas grandezas do
caminho sem suavização nenhuma — tudo o mais tem um filtro de um polo (energia
120/700 ms e 45/190 ms, brilho 90/180 ms). Medido no trecho de 13 a 25 s, a
proporção do terço superior do grave pulava de 0,36 para 0,92 em meio segundo, e
18 dos 78 valores ficavam grudados em 0 ou acima de 0,80. A torção piscava em
vez de girar.

Com 170 ms de filtro, medido no mesmo trecho e na mesma cadência:

| | salto por 450 ms | valores nos extremos |
|---|---|---|
| grave cru | 0,307 | 18/78 |
| grave suave | 0,177 | 1/78 |
| média-aguda crua | 0,215 | 9/78 |
| média-aguda suave | 0,131 | 0/78 |

## O transbordo do grave, 22/09

A autora apontou um quadro em que a forma grave ficava tão pontuda quanto a
média-aguda. Medido: era o transbordo somando um valor fixo (+0,45) a duas
janelas de larguras diferentes. O diagnóstico completo, os números antes e
depois e a hipótese testada e recusada estão na seção 5 do PRD, em *Picos de
brilho transbordam a régua*.

O que fica como lição de método: a frase que estava escrita no PRD — "a forma
grave continua sempre abaixo da média-aguda" — era verdadeira quando foi escrita
e **deixou de ser** sem que nada avisasse. Afirmação medida no texto precisa ser
remedida quando o código ao redor muda.

## Um bloco duplicado neste arquivo, 22/09

Ao acrescentar as seções acima descobri que as seis seções de 20 e 21/09
apareciam **duas vezes**, 67 linhas repetidas, com uma quebra de linha perdida na
emenda que colava um cabeçalho no outro. Veio de um script de edição de uma
sessão anterior. Conferido linha a linha que as duas cópias eram idênticas e
removida a segunda. Mesma família do erro do bloco `ordem`: script de edição que
erra e ninguém confere o arquivo depois.

## O que esta etapa NÃO cobre

- **O microfone não foi testado.** O código existe e pede os três recursos do navegador desligados, mas ninguém tocou nada nele ainda. Fica para a etapa 6, com a calibração.
- **A calibração ao vivo.** No modo arquivo ela é automática, pela passagem prévia. No microfone terá de vir de alguém tocando antes, porque ali não se conhece o futuro.
- **O gerador de sinais de teste.** Com upload, testar com um tom puro é subir um arquivo de tom puro. Fica como ferramenta de diagnóstico, para quando algo parecer errado.
- **O atraso físico não foi medido.** Só se sabe que a leitura sai a 43/s; quanto tempo o som leva do alto-falante ao olho exige gravar som e tela juntos.

## Como abrir

```
cd protótipo_v2/visual
python3 servir.py
```

Depois, `http://localhost:8675/`. O botão **Leitura**, no canto, recolhe e reabre o painel.
