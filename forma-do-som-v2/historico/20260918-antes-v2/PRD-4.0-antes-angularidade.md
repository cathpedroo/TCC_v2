# PRD: A forma do som — protótipo v2

Protótipo de visualizador de som instrumental baseado em correspondências crossmodais.
Documento de especificação para desenvolvimento assistido.

Versão 4.0, 18 de setembro de 2026. Primeira versão do protótipo v2. Muda o que o protótipo é: duas formas separadas, cada uma ouvindo uma faixa de frequência, reagindo ao som **enquanto ele acontece**. A versão anterior, que descrevia o v1 (fluxo simétrico, análise prévia em JSON, forma única contínua), está em `protótipo_v2/historico/20260918-antes-v2/PRD-antes.md` e continua valendo para o que já foi construído em `protótipo_v1/`.

Insumos desta versão, todos em `protótipo_v2/insumos/`:
- `comportamento da forma.pdf`, desenhado pela autora: a lógica de como cada forma se distribui nos eixos x e y.
- `leitura-audio/saida/leitura-audio-prototipo.md` e `leitura-audio/saida/faixas/faixas.md`: o que já se sabe sobre o áudio de teste.
- `audio-prototipo.mp3`: o mesmo trecho de 39,3 s usado no v1.
- `referencias-visuais/`: direção estética.

---

## 0. Antes de tudo, leia isto

Quem está tocando este projeto é uma estudante de design, não uma programadora. Isso muda como você deve trabalhar:

- Explique o que está fazendo em cada etapa, em português, sem jargão.
- Não avance duas etapas de uma vez. Faça uma, mostre o resultado, espere confirmação.
- Quando precisar instalar alguma coisa, avise antes e diga pra que serve.
- Se um erro aparecer, explique o que ele significa antes de corrigir.
- Nunca entregue um bloco grande de código sem dizer o que cada parte faz.

Todo parâmetro ajustável deve viver num único arquivo de configuração, comentado em português, para que ela possa mexer nos valores sem tocar na lógica.

---

## 1. O que muda do v1 para o v2

Quatro decisões da autora, de 18/09/2026, definem este documento.

| decisão | o que era no v1 | o que passa a ser no v2 |
|---|---|---|
| **Áudio ao vivo** | análise prévia em Python, gravada num JSON, e o desenho consultava o arquivo | o som é medido enquanto chega, no próprio navegador, pelo microfone ou por um arquivo tocando |
| **Duas formas** | uma silhueta única, contínua, que crescia para a direita | duas formas independentes, cada uma ouvindo uma faixa de frequência |
| **Forma dos médios-agudos** | não existia separada | reage à **leitura sustentada** de 350 a 6.000 Hz: o que se mantém soando |
| **Forma dos graves** | os ataques graves só deformavam a silhueta única | forma própria, que reage aos **ataques** de 30 a 220 Hz |
| **O que se mantém do v1** | tudo | **apenas o layout do site** |

O que "apenas o layout" quer dizer, em concreto, está na seção 8.

O que sai do escopo do v2, por consequência dessas decisões: o fluxo simétrico, o modo por entradas, o modo de formas separadas em scroll, a etapa A em Python como fonte do desenho, o contorno polar que morfa entre redondo e pontudo, a fórmula de angularidade com pesos 0,5/0,5, a posição vertical por F0, a aspereza, a planura, e a cor por emoção. Nada disso é apagado de `protótipo_v1/`: continua lá como registro do percurso e material do TCC.

---

## 2. O que este projeto é e o que não é

É um sistema que ouve música instrumental e desenha duas formas abstratas, onde cada característica visual corresponde a uma característica sonora. Parte das ligações tem apoio em achados publicados; parte é decisão de projeto. A tabela da seção 5 diz qual é qual.

Não é:

- Não é um espectro em barras nem uma forma de onda.
- Não pisca no ritmo, não tem partículas explodindo na batida.
- Não usa nenhum efeito visual que não esteja na tabela da seção 5.
- **Não separa instrumentos.** Dividir por faixa de frequência não é separar fontes. Um violão com corda grave e corda aguda aparece nas duas formas. Isto precisa estar escrito no texto da monografia, porque a leitura mais natural das duas formas é "uma é o baixo e a outra é a melodia", e não é isso.
- Não lê notas, acordes nem tonalidade. Essa leitura existe, está em `leitura-audio/`, e é um documento **sobre** a gravação; não alimenta o desenho (ver seção 4, limites do ao vivo).
- Não testa nada com pessoas. A verificação é técnica.
- **Não registra a sequência do som.** Esta é a perda mais séria do v2 e está declarada na seção 3.

Se em algum momento uma escolha visual não puder ser explicada pela tabela da seção 5, ela está fora do escopo.

---

## 3. A perda que o v2 assume, declarada

O v1 dizia: "o resultado registra a sequência do som". Uma forma crescia para a direita e o que passou ficava desenhado. O eixo horizontal era o tempo.

No v2, as duas formas ficam paradas no lugar e mudam de tamanho e de distribuição. **O eixo horizontal deixa de ser o tempo e passa a ser amplitude** (PDF da autora, pág. 3). Nada se acumula. A tela mostra só o instante presente.

Isso é uma escolha formal legítima — é o que torna o ao vivo possível — mas custa três coisas:

1. **Some o registro.** Não há mais imagem final que resuma o trecho. Se a monografia precisa de uma imagem estática por trecho, ela terá de vir de uma captura de tela num instante escolhido, ou de um modo de acúmulo acrescentado depois (ver pendência P4).
2. **Some a comparação entre momentos distantes.** No v1 dava para olhar o segundo 5 e o segundo 30 na mesma imagem. Agora só um de cada vez.
3. **Some a repetibilidade automática.** A mesma música tocada pelo microfone duas vezes não dá a mesma imagem: depende da sala, do volume, do microfone. A solução está na seção 4: **duas entradas, o mesmo caminho de código**.

Nenhuma dessas perdas é motivo para não fazer o v2. São motivo para escrevê-las no texto antes que a banca pergunte.

---

## 4. Áudio ao vivo: é possível, e o que muda

**Resposta curta: sim, é possível, e inteiramente dentro do navegador.** Tudo que o v2 precisa medir — energia por faixa, brilho por faixa, ataque por fluxo espectral — pode ser calculado olhando só para trás. As referências de implementação estão em `materiais de apoio/referencia-prototipo-ao-vivo.md`, seções 1 a 5.

### Duas entradas, um caminho só

Obrigatório, e é o que salva a reprodutibilidade do TCC:

```
   microfone  ──┐
                ├──► mesma captura ──► mesma leitura ──► mesmos eventos ──► mesmo desenho
arquivo tocando ┘
```

O arquivo `audio-prototipo.mp3` tocando pela página passa pelo **mesmo** código de leitura ao vivo que o microfone. Assim:

- o que vai para o anexo do TCC é gerado pelo modo arquivo, que é repetível e conferível;
- a performance ao vivo usa o mesmo desenho, sem um segundo sistema para manter;
- qualquer diferença entre os dois é diferença da sala e do microfone, não do algoritmo.

Sem isso, o v2 não tem nenhum resultado citável.

### Captura

| parâmetro | valor | por quê |
|---|---|---|
| janela (FFT) | 2.048 amostras, ~46 ms | reage rápido a ataque; resolve mal os graves, e é o preço aceito |
| salto | 1.024 amostras, ~23 ms | ~43 leituras por segundo, medido no áudio de teste |
| onde roda | AudioWorklet | a leitura não fica presa à velocidade da tela (armadilha do TypePulse) |
| microfone | `echoCancellation`, `noiseSuppression` e `autoGainControl` **desligados** | senão o navegador achata a dinâmica antes de o protótipo medir |
| saída | o microfone **nunca** vai para as caixas | microfonia |

**Atenção ao filtro de entrada.** A referência sugere passa-alta em 55 Hz contra ruído de mesa (StrumSurfer). **Não use 55 Hz neste material.** O pico mais grave do áudio de teste é 44,3 Hz = Fá1, e ele é a nota mais grave de todo o trecho depois dos 22 s (`leitura-audio-prototipo.md`). Um corte em 55 Hz apagaria exatamente o evento estrutural da peça. Use **30 Hz**, que é o piso da faixa grave declarada, e aceite algum ruído de manuseio.

### O que o ao vivo não pode fazer, e o que se faz no lugar

| o v1 fazia | por que não dá ao vivo | o v2 faz |
|---|---|---|
| separação harmônica/percussiva (HPSS por medianas) | as medianas olham para frente e para trás no tempo | separação só por faixa de frequência: 30–220 Hz e 350–6.000 Hz. O "sustentado" passa a ser o envelope lento da faixa média-aguda, não uma parcela harmônica isolada |
| filtro Butterworth aplicado nos dois sentidos | precisa do arquivo inteiro na mão | soma de energia direto nos bins da FFT, sem filtro e sem atraso extra |
| normalizar pelos percentis 5 e 95 do trecho inteiro | não se conhece o futuro | percentis 5 e 95 de uma janela móvel de 3 s (ver medição abaixo) |
| notas, croma, acorde, tonalidade, andamento | métodos que precisam de segundos de contexto, e que já erram em mistura | **não entram no v2.** Ficam no relatório `leitura-audio/` como caracterização do material |
| escolher os nascimentos olhando a lista completa de ataques | idem | detector causal com limiar adaptativo e período refratário de 110 ms |

**Medição feita em 18/09/2026 sobre `audio-prototipo.mp3`**, comparando normalizar pelo arquivo inteiro contra normalizar por janela móvel de 3 s: a diferença média no brilho normalizado foi de **0,06 numa escala de 0 a 1**. Para este material, a normalização móvel praticamente não distorce a imagem. Isso não vale automaticamente para outra gravação, e precisa ser refeito se o material mudar.

### Atraso

O atraso é inevitável e vem de três lugares que se somam: a janela (~46 ms), a suavização causal (140 a 180 ms, ver seção 6) e a tela (~16 ms). O total esperado fica na ordem de **200 ms para o gesto sustentado e 60 ms para o ataque grave** — o ataque é propositalmente pouco suavizado, para chegar junto com o som.

Medir o atraso real exige gravar som e tela juntos. As conferências internas só medem o atraso do desenho em relação ao relógio do sistema. Declarar essa diferença.

### Calibração, antes de tocar

Uma etapa curta antes da performance, inspirada no StrumSurfer:

1. Silêncio por 2 s: mede o ruído da sala e fixa o piso de cada faixa.
2. Toca-se o instrumento por ~10 s: fixa a escala de amplitude e de brilho daquele instrumento naquela sala.
3. Os valores ficam visíveis e editáveis no painel; dá para pular a calibração e usar os padrões.

---

## 5. Tabela de mapeamento do v2

Esta tabela é o coração do projeto. Cada linha deve aparecer como comentário no código, ao lado da função que a implementa, com o código da ficha (F01, F02...) e a referência curta. A ficha completa de cada fonte está no anexo, seção 12.

Colunas: **tipo** é a classificação de Spence (2011, Tabela 2, p. 987): estrutural, estatística ou semanticamente mediada. **Regime** é verificável quando há resposta publicada para conferir, propositivo quando é decisão de projeto declarada.

| # | o que se mede | em qual forma | parâmetro visual | direção | fontes | tipo | regime |
|---|---|---|---|---|---|---|---|
| V1 | energia da faixa 350–6.000 Hz, envelope lento | triângulo | extensão no eixo x | mais forte, mais se distribui pelas extremidades x | Smith & Sera 1992 via F16; Lipscomb & Kim 2004 via F05 e F11; precedente em F05 | estatística | apoio indireto; o eixo x como medida de amplitude é decisão da autora (PDF, pág. 3) |
| V2 | centroide espectral dentro de 350–6.000 Hz, em log2 | triângulo | distribuição no eixo y: centro ↔ extremidades | mais agudo, mais vai para as extremidades y | F16 Spence 2011; F04 Eitan & Granot 2006; F08 Küssner & Leech-Wilkinson 2014 | estatística e semântica | **propositivo.** Ver a ressalva da simetria, abaixo |
| V3 | fluxo espectral positivo em 30–220 Hz | círculo | nascimento e força do acento | acima do limiar, o círculo é empurrado | decisão de projeto; apoio parcial em F02, F05 e F17 | não se aplica | propositivo |
| V4 | energia da faixa 30–220 Hz | círculo | extensão no eixo x | mais forte, mais se distribui pelas extremidades x | mesmas de V1 | estatística | apoio indireto |
| V5 | centroide espectral dentro de 30–220 Hz | círculo | distribuição no eixo y | mais agudo dentro do grave, mais para as extremidades y | mesmas de V2 | estatística e semântica | propositivo |
| V6 | a faixa a que a forma pertence, fixa | as duas | identidade: **círculo** = subgrave-médio, **triângulo** = médio agudo-agudo | mais agudo, mais pontudo | F14 Passi & Arun 2022; F06 Fort & Schwartz 2022; Marks 1987a via F16 | estatística | **ver a ressalva da identidade fixa**, abaixo |
| V7 | centroide dentro da própria faixa | as duas | angularidade dentro da identidade | mais agudo, mais pontudo | mesmas de V6 | estatística | opcional, decide a pendência P1 |

Aspereza, planura, F0, posição vertical assinada e cor por emoção **não entram no v2**.

### Ressalva da simetria no eixo y

A correspondência entre altura e posição vertical é a mais replicada das que o projeto usa (F16, p. 976): agudo **em cima**, grave **embaixo**. É um eixo com sinal.

O que o PDF da autora pede é diferente: agudo vai para **as duas** extremidades do eixo y, grave se acumula **no centro**. Isso contém o "agudo em cima" mais o seu espelho. Nenhuma das fontes mede isso. É decisão formal, e é a mesma decisão que o v1 já tinha tomado no fluxo simétrico, com a mesma declaração: a simetria foi pedida pela autora como escolha formal e **não constitui validação da correspondência perceptual de "agudo em cima"**.

Escrever isso no capítulo. É a pergunta mais provável da banca sobre a forma.

### Ressalva da identidade fixa

O círculo para o grave e o triângulo para o agudo é a ligação com **mais** apoio no projeto inteiro: Passi & Arun obtêm r = .88 e .89 entre a frequência média do espectro e a escolha da forma pontuda (F14), e Fort & Schwartz dão o mecanismo físico (F06).

Mas no v2 essa correspondência vira **constante**. Cada forma está presa à sua faixa e nunca muda de identidade. Ou seja: o círculo e o triângulo passam a ser uma **legenda** das faixas, não uma medida do som. Nada na tela testa a correspondência; ela só é ilustrada.

Duas saídas, e a autora precisa escolher (pendência P1):

- **(a) manter a identidade fixa e acrescentar V7**: o triângulo fica mais ou menos pontudo conforme o brilho dentro de 350–6.000 Hz, e o círculo ganha um leve facetamento conforme o brilho dentro de 30–220 Hz. A correspondência volta a medir alguma coisa, dentro de cada forma. **Recomendação.**
- **(b) manter só a identidade fixa**, e declarar no texto que a forma é legenda de faixa, não medida.

A opção (a) tem material: a medição de 18/09 mostra que o brilho dentro da faixa média-aguda anda de **591 a 3.832 Hz**, uma razão de 3,5× entre o percentil 5 e o 95, ou 1,8 oitava. Há o que mover.

### Sobre a honestidade da tabela

Três ressalvas que devem constar como comentário no código e no texto:

A ligação entre frequência e forma pontuda tem apoio direto com o próprio centroide (F14) e mecanismo físico (F06), mas foi medida em **sons curtos e isolados**, não em mistura polifônica contínua.

A distribuição simétrica no eixo y e a extensão no eixo x por amplitude são decisões de projeto da autora, com apoio apenas indireto e parcial.

Tudo o que o protótipo faz com música contínua e polifônica é extensão propositiva. As fontes não validam a combinação específica aplicada aqui à mistura. **Dividir por faixa de frequência não valida separação de fontes por este algoritmo.**

---

## 6. Como cada forma se comporta

### Base geométrica, comum às duas

Cada forma vive num sistema de eixos próprio, com centro fixo, conforme o PDF `comportamento da forma.pdf`:

- **Eixo x — amplitude.** Quanto maior a energia da faixa, mais a forma se distribui pelas extremidades do eixo x (PDF, pág. 3). Silêncio deixa a forma recolhida perto do centro; som forte a espalha na horizontal.
- **Eixo y — altura do som.** Quanto mais grave, mais a forma se acumula no centro; quanto mais aguda, mais ela vai para as extremidades do eixo y (PDF, pág. 4).
- **O centro nunca se desloca.** A forma se expande e se recolhe em torno dele, nos dois sentidos de cada eixo.
- **Identidade** (PDF, pág. 5): a forma da faixa subgrave-média é um **círculo**; a da faixa média-aguda a aguda é um **triângulo**.

Os dois eixos são independentes: uma forma pode ficar larga e baixa (forte e grave) ou estreita e alta (fraca e aguda).

### A forma dos médios-agudos: leitura sustentada

Ouve 350 a 6.000 Hz. Responde ao que **se mantém**, não ao que bate.

- Extensão em x: envelope lento da energia da faixa, suavização causal de **140 ms**.
- Distribuição em y: centroide dentro da faixa, em log2, suavização causal de **180 ms**, escalado entre limites fixos da faixa.
- Sem nascimento, sem acento, sem evento. É um gesto contínuo que engrossa e afina.
- Em silêncio, recolhe-se ao repouso, sem sumir.

A suavização longa é o que produz a sensação de "sustentado", e é também a origem do atraso de ~200 ms. As duas coisas são a mesma coisa; não dá para ter uma sem a outra.

### A forma dos graves: ataques

Ouve 30 a 220 Hz. Responde ao que **bate**, não ao que se mantém.

- Detecção: fluxo espectral positivo dentro da faixa, limiar adaptativo sobre a média e o desvio dos últimos 2 s, período refratário de **110 ms**.
- Cada ataque aceito dá um empurrão: subida de **25 ms**, queda de **220 ms**. O empurrão soma extensão em x e em y sobre o valor de repouso.
- Entre ataques, a forma volta ao repouso, que segue a energia lenta da faixa (V4) e o centroide da faixa (V5).
- Ataques sobrepostos somam. Não se cancelam nem reiniciam a queda.

**Medição feita em 18/09/2026** sobre `audio-prototipo.mp3`, com este detector: **62 ataques em 39,3 s (1,6 por segundo)**, intervalo mediano de 650 ms entre eles, mínimo de 116 ms. Com o acento de 220 ms, **23% dos pares seguidos ficariam sobrepostos** — ou seja, a maior parte dos impactos vai aparecer isolada e legível, com pares ocasionais. A duração de 220 ms está adequada a este material e não precisa ser reduzida.

Cuidado: o número de 248 ataques (6,3 por segundo) do relatório `leitura-audio-prototipo.md` é de **outra medida** — ataques do espectro inteiro, com o detector do librosa, com contexto de futuro. Não compare os dois números; eles medem coisas diferentes.

### Composição na tela

As duas formas ocupam o mesmo palco, com centros distintos, e podem se sobrepor. A posição dos dois centros, a escala relativa e a ordem de desenho são decisões de composição da autora, feitas com controles no painel, não medidas do som. Registrar os valores escolhidos.

---

## 7. Configuração

Tudo abaixo fica em um arquivo de configuração comentado em português, separado da lógica:

entrada (microfone ou arquivo), ganho de cada entrada, limites das duas faixas em Hz, frequência do passa-alta de entrada, tamanho da janela e do salto, constantes de suavização de cada forma (140 e 180 ms), limiar adaptativo e período refratário do detector de ataque, subida e queda do acento (25 e 220 ms), janela da normalização móvel (3 s), extensão mínima e máxima em x e em y de cada forma, posição dos dois centros, escala relativa entre as formas, liga/desliga da angularidade variável (V7), valores da calibração, resolução do palco, cores do campo e das formas.

A pessoa precisa conseguir mudar qualquer um desses valores, salvar, recarregar a página e ver a diferença. Sem editar código.

---

## 8. Layout: o que se mantém do v1

Mantém-se **a casca visual da página**, não o conteúdo dela. Concretamente, de `protótipo_v1/visual/index.html` e `estilo.css`:

| mantém | detalhe |
|---|---|
| painel branco à esquerda | recolhível e reabrível pelo botão "Parâmetros", com o título "A forma do som." no cabeçalho |
| tipografia e traço | fundo branco do painel, texto preto, linhas finas, controles secundários recolhidos em `details` |
| campo de desenho | `#101312`, ocupando o palco; as formas em `#cccccc` |
| palco lógico | 1920 × 1080, ajustado proporcionalmente ao espaço, sem distorção |
| transporte inferior | discreto, centralizado: reproduzir/pausar, voltar ao início, silenciar, barra de tempo — **só no modo arquivo** |
| padrões de controle | rótulo + valor numérico à direita, extremos nomeados sob o slider ("Mais devagar / Mais rápido"), nota curta explicando o controle |
| acessibilidade | `aria-label`, `aria-pressed`, `role="status"` com `aria-live` para mensagens |

Muda o conteúdo do painel: saem os seletores de estudo (estático / movimento / com áudio), o seletor de estrutura (fluxo / por entradas / separadas), leitura do timbre, força mínima da entrada, granulação, cor pela emoção, "Ver figura inteira", "Comparar momentos". Entram: escolha da entrada (microfone / arquivo), calibração, ganho de cada forma, e os controles de composição da seção 6.

No modo microfone não há barra de tempo nem botão de recomeçar: não existe posição no tempo. O transporte é substituído por um indicador de entrada ativa e um botão de parar.

---

## 9. Ordem de entrega

1. **Página vazia com o layout do v1** e duas formas desenhadas paradas, com controles manuais de extensão x e extensão y. Sem áudio nenhum. Confirmar com a autora que a geometria do PDF está certa: círculo e triângulo, centro fixo, os dois eixos independentes.
2. **Entrada de áudio funcionando**, modo arquivo, com um único número na tela: a energia de cada faixa. Só para conferir que a leitura está viva e que os números andam.
3. **Forma dos médios-agudos** ligada à leitura sustentada. Avaliar com a autora antes de seguir.
4. **Forma dos graves** ligada aos ataques. Avaliar o atraso percebido e a duração do acento.
5. **Modo microfone** com calibração, usando o mesmo caminho de código.
6. Opcional, conforme a pendência P1: angularidade variável dentro de cada forma (V7).

Cada etapa é entregue e verificada antes da seguinte. Cada uma ganha um arquivo de conferência em `protótipo_v2/visual/`, no padrão dos `VERIFICACAO-*.md` do v1.

---

## 10. Aceite

A verificação é técnica, sem pessoas.

1. **As duas formas não andam juntas.** Gravar os valores das duas ao longo do trecho e calcular a correlação. Medição de referência de 18/09/2026 no áudio de teste: entre o ataque grave e o brilho médio-agudo, r = −0,08; entre a energia grave e o brilho médio-agudo, r = −0,53. Se na implementação as duas formas ficarem com correlação acima de 0,8, alguma coisa está ligada errado.
2. **O corte dos 22 s aparece.** No áudio de teste, a partir de 22 s a energia grave sobe cerca de 10 dB e o brilho cai de ~1.644 para ~1.286 Hz (medianas). O círculo tem de ficar visivelmente mais extenso e o triângulo tem de se recolher em direção ao centro do eixo y. Se nada mudar ali, a escala está achatada.
3. **Nenhuma forma pisca, treme ou salta.** Entre ataques, o círculo volta ao repouso suavemente.
4. **O ataque chega antes do gesto.** O acento grave deve responder em torno de 60 ms e o gesto sustentado em torno de 200 ms. Conferir com um sinal de teste: um clique seco seguido de um tom sustentado.
5. **Modo arquivo é repetível.** Tocar o mesmo arquivo duas vezes tem de dar a mesma sequência de valores. Se não der, há dependência da velocidade da tela.
6. **Sinais de controle.** Um tom puro subindo de 100 Hz a 5.000 Hz tem de mover só uma forma de cada vez nas faixas certas, e nenhuma entre 220 e 350 Hz. Um ruído de banda larga move as duas.

Se houver falha, conferir captura, normalização, detecção, implementação gráfica e hipótese de mapeamento, nessa ordem. Não atribuir a falha a uma única camada automaticamente.

---

## 11. Pendências que a autora precisa resolver

**P1. Identidade fixa ou angularidade variável (V7).** Decidir entre (a) e (b) da seção 5. Recomendação: (a). Sem isso, a correspondência com mais apoio no projeto não mede nada na tela.

**P2. A simetria no eixo y.** Já está declarada na seção 5, mas precisa entrar no capítulo como decisão formal, não como aplicação de F16/F04/F08. Decidir também se a assimetria de Eitan & Granot (F04) — descida puxa mais que subida — entra de alguma forma, ou se fica declarada como não adotada.

**P3. Composição dos dois centros.** Onde cada forma fica no palco, se podem se sobrepor, qual desenha por cima. É decisão estética e precisa ser registrada como tal.

**P4. O registro perdido.** Decidir se o v2 ganha algum modo de acúmulo — um rastro, uma marca a cada ataque, uma captura por trecho — ou se o TCC assume que o registro do percurso é do v1 e o presente é do v2. Não decidir isto deixa o capítulo sem imagem estática.

**P5. Onde o ao vivo entra.** TCC 1, TCC 2 ou trabalho futuro. A resposta muda quanto do modo microfone precisa estar pronto e quanto pode ficar como demonstração.

**P6. Cor.** Fora do v2 por decisão de escopo. Se voltar, volta com a especificação inteira do v1 (seção 8 do PRD anterior), inclusive a restrição de luminosidade compartilhada por valência. Não reabrir pela metade.

Da bibliografia e dos capítulos, continuam abertas as pendências do PRD anterior, que não mudam com o v2: referências citadas via outro autor, a correção sobre os estímulos de Zacharakis, a data de Passi & Arun, os anais de Liew et al., a paginação de Hamilton-Fletcher et al., e a entrada de Erdmann et al. e Lembke na bibliografia categorizada.

---
## 12. Anexo: o que cada fonte diz

Cada ficha traz a referência, o que o estudo fez, o que encontrou com página, onde entra no PRD e o limite para este projeto. Páginas são as da revista, exceto onde indicado. Os códigos F01 a F21 são os usados no código e nas tabelas.

### F01. Adeli, Rouat & Molotchnikoff (2014)

Adeli, M., Rouat, J. & Molotchnikoff, S. (2014). Audiovisual correspondence between musical timbre and visual shapes. Frontiers in Human Neuroscience, 8, 352. doi 10.3389/fnhum.2014.00352
Arquivo: SONS PUROS/01_Adeli_2014_AudiovisualMusicalTimbre.pdf

O que fizeram: experimento online com 119 pessoas (36 músicos profissionais, 47 amadores, 36 não músicos). 23 sons de oito instrumentos, com loudness igualada e envelope normalizado, em F0 de 100, 150, 200 e 250 Hz. Para cada som, escolhiam forma, cor (ou tom de cinza) e posição vertical (p. 1-2).

O que encontraram:
- timbre suave foi associado a forma arredondada, em azul, verde ou cinza claro; timbre áspero, a forma angular, em vermelho, amarelo ou cinza escuro; timbre com os dois traços, a forma mista (p. 1)
- cor ou cinza não mudou a escolha de forma (p. 1)
- a F0 não se associou a altura na tela, a tom de cinza nem a cor (p. 1)
- a F0 mudou a forma só para violoncelo e violão: arredondada em 100 e 150 Hz, parcialmente angular em 200 e 250 Hz; para piano, marimba e sax, não mudou (p. 5)

No PRD: nota da linha 3 e contexto da linha 1.
Limite: mede timbre como categoria (suave, áspero), não descritor. Em cinza, áspero puxa escuro, o que vai contra "mais brilhante, mais claro" quando aspereza e brilho andam juntos.

### F02. Athanasopoulos & Antović (2018)

Athanasopoulos, G. & Antović, M. (2018). Conceptual integration of sound and image: a model of perceptual modalities. Musicae Scientiae, 22(1), 72-87. doi 10.1177/1029864917713244
Arquivo: SONS PUROS/01_Athanasopoulos_2018_ConceptualIntegrationSoundImage.pdf

O que fizeram: modelo teórico de "musical shape" a partir de teoria da mesclagem conceitual, com dados de campo em três países (p. 72).
O que encontraram: nas escolhas forçadas, legato foi pareado com linha contínua e staccato com pontos; a variação de altura, com variação de altura no plano (p. 76).
No PRD: apoio parcial da linha 8. Articulação separada puxa elementos separados.
Limite: não trata de forma pontuda ou redonda.

### F03. Blazhenkova & Kumar (2018)

Blazhenkova, O. & Kumar, M. M. (2018). Angular versus curved shapes: correspondences and emotional processing. Perception, 47(1), 67-89. doi 10.1177/0301006617731048
Arquivo: MULTISSENSORIAIS/03_Blazhenkova_2017_AngularCurvedShapesEmotion.pdf

O que fizeram: pareamento de formas angulares e curvas com atributos de cinco sentidos, emoção, gênero e nome; estudo 1 com 197 estudantes (p. 73), estudo 2 com experiências reais.
O que encontraram: curva com som calmo ou baixo, verde, liso, alívio; angular com som alto ou dinâmico, vermelho, áspero, excitação ou surpresa (p. 67).
No PRD: não entra como mapeamento. Registra que o RMS poderia empurrar angularidade; o protótipo não faz isso, para não sobrecarregar o contorno.

### F04. Eitan & Granot (2006)

Eitan, Z. & Granot, R. Y. (2006). How music moves: musical parameters and listeners' images of motion. Music Perception, 23(3), 221-248.
Arquivo: SONS PUROS/Eitan & Granot (2006), Music Perception.pdf

O que fizeram: dois experimentos com estudantes (78 no primeiro, 95 no segundo; p. 227-228). Pares de trechos curtos em piano, um intensificando e outro atenuando um parâmetro (dinâmica, contorno de altura, intervalo, taxa de ataque, articulação). Ouvintes descreviam o movimento imaginado de um personagem.
O que encontraram:
- a maioria dos parâmetros afeta várias dimensões do movimento imaginado, não uma só (p. 221)
- as analogias são assimétricas: a relação altura–verticalidade vale sobretudo para descidas e fraca para subidas (p. 221)
- atenuações puxam descida no espaço; intensificações puxam aumento de velocidade, mais do que subida (p. 221)
- descida de altura também puxa movimento para a esquerda; subida não puxa para a direita (p. 233)

No PRD: linha 3 e pendência da assimetria.

### F05. Erdmann, von Berg & Steffens (2025)

Erdmann, M., von Berg, M. & Steffens, J. (2025). Development and evaluation of a mixed reality music visualization for a live performance based on music information retrieval. Frontiers in Virtual Reality, 6, 1552321. doi 10.3389/frvir.2025.1552321
Arquivo: MULTISSENSORIAIS/Erdmann, von Berg e Steffens (2025).pdf

O que fizeram: visualização de música ao vivo em realidade mista, desenhada a partir de correspondências crossmodais, com 62 participantes (p. 5). Compararam com uma versão de controle em que cor e movimento eram aleatórios.
Descritores e mapeamentos usados (p. 5-7):
- altura (algoritmo YIN, com valor de confiança) → posição vertical
- loudness → tamanho
- dissonância sensorial do Essentia, calculada sobre picos espectrais → geometria mais angulosa
- onsets por spectral flux → posicionar e transformar formas no ritmo
- valência e excitação estimadas pelo modelo `emomusic-msd-musicnn` (R² = .646 para excitação, .515 para valência; uma estimativa por segundo; p. 5) → cor: excitação alta mais vermelha, valência alta mais amarela

Da revisão de literatura do artigo:
- pitch se associa mais a posição vertical do que a tamanho; loudness a tamanho (p. 2)
- música de excitação alta puxa cor mais saturada, mais escura e mais vermelha; valência alta puxa mais clara e mais amarela (Whiteford et al., 2018; p. 3; lido no original em F21)
- a assincronia audiovisual percebida vai de 75 a 258 ms conforme o estímulo, e fica entre 25 e 50 ms para bipes e flashes curtos (Vroomen & Keetels, 2010; p. 3)

O que encontraram: a versão ligada à análise teve experiência estética levemente melhor que a aleatória.
No PRD: precedente das linhas 4, 5, 6 e 8; tolerância de sincronia; caminho para emoção offline. Entra também no cap. 3.
Limite: tempo real, sem espaço tímbrico, com público. Os mapeamentos são escolhas dos autores a partir da literatura, não resultados medidos por eles.

### F06. Fort & Schwartz (2022)

Fort, M. & Schwartz, J.-L. (2022). Resolving the bouba-kiki effect enigma by rooting iconic sound symbolism in physical properties of round and spiky objects. Scientific Reports, 12, 19172. doi 10.1038/s41598-022-23623-w
Arquivo: SONS PUROS/01_Fort_2022_ResolvingBoubaKikiEnigma.pdf
Páginas: numeração do artigo.

O que fizeram:
- modelo aplicado a dados de 8 publicações (10 experimentos, 394 participantes, 1086 estímulos de fala, cinco línguas) (p. 2)
- o modelo passa o som por um banco de 64 filtros gammatone de 50 a 20.000 Hz. Na equação 1, Balance é a energia somada abaixo do corte menos a energia acima, com o corte variando entre o canal 20 (800 Hz) e o 30 (1800 Hz). Continuity é log(mínimo/máximo) da energia somada ao longo do estímulo (p. 2 e 9)
- Noise Band Experiment, com 31 falantes nativos de francês: ruído em banda de 300 a 1200 Hz (300, 500, 600, 700, 800, 900, 1000 e 1200), largura de banda de um décimo da frequência central, 500 ms, com vale de 225 a 275 ms em 0, 0,1, 0,5 ou 1 (p. 4 e 9)
- Beating Toys Experiment, com 29 participantes: sons de objetos redondos e pontudos batidos (p. 5 e 10)

O que encontraram: o efeito kiki-bouba depende de balance espectral e continuidade temporal; objetos redondos produzem, ao bater ou rolar, espectro mais grave e som mais contínuo que objetos pontudos do mesmo tamanho; adultos são sensíveis a essa regularidade (p. 1).
No PRD: linhas 1 e 2; aceite 2 da etapa A; aceite 3 da etapa B.
Limite: continuity foi calculada sobre o estímulo inteiro, e só em estímulos com consoante entre vogais (p. 9). A janela deslizante do PRD é adaptação.

### F07. Hamilton-Fletcher, Witzel, Reby & Ward (2017)

Hamilton-Fletcher, G., Witzel, C., Reby, D. & Ward, J. (2017). Sound properties associated with equiluminant colours. Multisensory Research.
Arquivo: SONS PUROS/01_Hamilton_2017_SoundPropertiesEquiluminantColours.pdf
Páginas: do manuscrito aceito.

O que fizeram: 44 estudantes (p. 7) ajustaram cores de luminância física igual até combinar com sons: tons puros de 100 a 3200 Hz e de 440 a 880 Hz, tons puros em quatro níveis de loudness, sons complexos de 100 a 3200 Hz com energia deslocada para graves ou agudos, e timbres vocais (p. 10-11).
O que encontraram:
- frequência sobe, croma sobe (tons, senoides complexas, timbres vocais) (p. 1)
- loudness sobe, croma sobe: r(2) = .96, p = .04 nas médias; por indivíduo, média de r = .86, t(43) = 3,0, p = .005 (p. 13)
- em som de banda estreita, grave puxa azul e caminha para amarelo até 800 Hz; loudness também desloca de azul para amarelo (p. 1)
- em sons complexos de mesma banda, 100 a 3200 Hz, todos puxaram amarelo, independentemente de onde estava a energia (p. 1)

No PRD: nota da linha 6, como evidência registrada e não usada.
Limite: tons e bandas estreitas; música é banda larga. Por isso a cor não sai do sinal.

### F08. Küssner & Leech-Wilkinson (2014)

Küssner, M. B. & Leech-Wilkinson, D. (2014). Investigating the influence of musical training on cross-modal correspondences and sensorimotor skills in a real-time drawing paradigm. Psychology of Music, 42(3), 448-469. doi 10.1177/0305735613482022
Arquivo: SONS PUROS/Küssner & Leech-Wilkinson (2014), Psychology of Music.pdf

O que fizeram: 71 participantes incluídos na análise (41 com formação musical, 30 sem; p. 452) desenharam numa mesa digitalizadora enquanto ouviam 18 sequências de tons puros de 4,5 a 14,3 s, variando altura (123 a 294 Hz), loudness e andamento, mais dois trechos do Prelúdio op. 28 n. 6 de Chopin (p. 453).
O que encontraram:
- a maioria representou altura com posição vertical e loudness com espessura da linha (p. 448)
- pessoas sem formação musical usaram estratégias mais variadas e tenderam a ignorar a altura quando ela não mudava (p. 448)
- altura–posição foi representada com mais precisão que loudness–espessura (p. 448)

No PRD: linha 3; alternativa na nota da linha 4; tensão da linha 8 (com som que dura, desenha-se trajetória).

### F09. Lembke (2023)

Lembke, S.-A. (2023). Distinguishing between straight and curved sounds: auditory shape in pitch, loudness, and tempo gestures. Attention, Perception, & Psychophysics, 85, 2751-2773. doi 10.3758/s13414-023-02764-8
Arquivo: MULTISSENSORIAIS/Lembke (2023) Attention, Perception & Psychophysics.pdf

O que fizeram: 20 participantes (p. 2757) pareavam gestos sonoros de altura, loudness e andamento, cada um em quatro escalas físicas, com segmentos de linha reta ou curva.
O que encontraram:
- os participantes distinguem de forma confiável a forma do gesto em altura e em loudness (p. 2751)
- gesto de altura linear em ERB-rate e gesto de loudness linear em amplitude bruta foram os mais próximos da linha reta; as outras escalas pareceram curvas exponenciais ou logarítmicas (p. 2751)
- em andamento, não houve diferença confiável (p. 2767)
- fórmula da ERB-rate usada: E(f) = 21,4 · log10(4,37 · f / 1000 + 1), de Glasberg & Moore (1990) (p. 2770)

No PRD: escalas da normalização (F0 em ERB-rate, RMS linear).

### F10. Liew, Styles & Lindborg (2017)

Liew, K., Styles, S. J. & Lindborg, P. (2017). Dissonance and roughness in cross-modal perception. O PDF não traz onde foi publicado.
Arquivo: SONS PUROS/01_Liew_2017_DissonanceRoughnessPerception.pdf

O que fizeram (p. 1):
- estudo 1, com 20 participantes: oito notas isoladas de corda ou flauta avaliadas em dissonância, forma (curva a pontuda), textura (áspera a lisa) e dureza. Aspereza calculada com o patch de MacCallum (2006)
- estudo 2, com 41 participantes: oito sons sintetizados por FM com aspereza em quatro níveis (0, 0,1, 0,5 e 1), em 110 e 220 Hz; escolha forçada entre figura pontuda e curva

O que encontraram (p. 1):
- estudo 1: dissonância percebida afetou textura (p = .002) e forma (p = .03); a aspereza calculada não teve efeito, possivelmente pela faixa estreita de aspereza em sons instrumentais
- estudo 2: aspereza maior levou à figura mais pontuda (p < .001); a dissonância percebida não teve efeito

No PRD: linha 5; tabela de decisões da seção 5.
Limite: a aspereza que funcionou foi sintética e controlada. Com notas reais, não funcionou.

### F11. Lindborg & Friberg (2015)

Lindborg, P. & Friberg, A. K. (2015). Colour association with music is mediated by emotion: evidence from an experiment using a CIE Lab interface and interviews. PLoS ONE, 10(12), e0144013. doi 10.1371/journal.pone.0144013
Arquivo: MULTISSENSORIAIS/Lindborg & Friberg (2015).pdf
Páginas: numeração do artigo, de 1 a 26.

O que fizeram: 22 participantes manipulavam continuamente cor (CIE Lab) e tamanho de uma mancha enquanto ouviam 27 trechos de trilha de cinema, previamente avaliados em emoções discretas (raiva, medo, alegria, tristeza, ternura) e dimensionais (valência, energia, tensão) (p. 1 e 7).
O que encontraram:
- música alegre com amarelo; raiva com manchas grandes e vermelhas; tristeza com manchas menores em azul escuro (p. 1)
- energia baixa com manchas menores, mais escuras e mais azuis; tensão alta com cor mais escura (d = .78) (p. 13-14, Tabelas 4 e 5)
- o tamanho da mancha se correlacionou com sharpness, brightness, entropia espectral e fluxo espectral; os parâmetros de cor não se correlacionaram significativamente com nenhum descritor de áudio após a correção (p. 13-14)
- modelos que incluíam emoção explicaram de 60 a 75% da variação de cada parâmetro de cor (p. 1)

No PRD: linha 6 e cantos de cor.
Limite: nas emoções dimensionais, cada extremo foi representado por dois trechos, e valência baixa puxou vermelho e amarelo (Tabela 4), o que não bate com as emoções discretas. A diferença de luminosidade entre valência alta e baixa não foi estatisticamente significativa (p = .19, Tabela 5, p. 14), embora as médias tenham sido 53,5 e 41,1, respectivamente (Tabela 4). Para os cantos, o PRD usa as emoções discretas deste estudo junto com F20 e F21; a regra de luminosidade por valência é uma decisão com apoio parcial.

### F12. McAdams, Winsberg, Donnadieu, De Soete & Krimphoff (1995)

McAdams, S., Winsberg, S., Donnadieu, S., De Soete, G. & Krimphoff, J. (1995). Perceptual scaling of synthesized musical timbres: common dimensions, specificities, and latent subject classes. Psychological Research, 58, 177-192.
Arquivo: SONS PUROS/McAdams et al. (1995).pdf

O que fizeram: dissimilaridade entre 18 timbres sintetizados, julgada por 88 pessoas (músicos profissionais, amadores e não músicos) (p. 185, Fig. 1).
O que encontraram: espaço de três dimensões comuns, quantificadas por log do tempo de subida (ataque), centroide espectral e grau de variação espectral (fluxo) (p. 177).
No PRD: linha 2 (ataque como dimensão do timbre) e fundamento do centroide.

### F13. Parise & Spence (2009)

Parise, C. V. & Spence, C. (2009). 'When birds of a feather flock together': synesthetic correspondences modulate audiovisual integration in non-synesthetes. PLoS ONE, 4(5), e5664. doi 10.1371/journal.pone.0005664
Arquivo: MULTISSENSORIAIS/03_Parise & Spence_2009_SoundShapeCorrespondences.pdf

O que fizeram (p. 2-3): três experimentos de julgamento de ordem temporal e de posição.
- experimento 1, com 12 participantes: tons de 26 ms, de 300 Hz (grave) e 4500 Hz (agudo), com círculos cinza pequenos ou grandes. Par congruente: tom agudo com círculo pequeno e tom grave com círculo grande
- experimento 2: tom de onda quadrada a 1760 Hz e senoide a 440 Hz, com estrelas de 7 pontas, uma de contorno curvo e outra pontuda. Par congruente: estrela pontuda com o tom mais agudo

O que encontraram: com pares congruentes, as pessoas ficaram menos sensíveis à assincronia e à distância espacial entre som e imagem, sinal de que a correspondência favorece a integração (p. 1).
No PRD: tensão declarada na linha 4 (altura–tamanho não é usada).

### F14. Passi & Arun (2022/2024)

Passi, A. & Arun, S. P. (2024). The Bouba–Kiki effect is predicted by sound properties but not speech properties. Attention, Perception, & Psychophysics, 86, 976-990. Publicado online em 16 de dezembro de 2022. doi 10.3758/s13414-022-02619-8
Arquivo: SONS PUROS/01_Passi_2022_BoubaKikiSoundProperties.pdf

O que fizeram:
- palavras faladas, palavras invertidas e sons de objetos reais batidos, com 45 participantes (p. 976)
- tons puros, com 28 participantes: 20 tons com a mesma frequência média das palavras (p. 986)
- frequência média de cada som: espectro de potência de Fourier, normalizado como distribuição de probabilidade, e a média dessa distribuição (p. 981). É o centroide espectral.

O que encontraram:
- frequência média correlacionada com a escolha da forma pontuda: r = .78 em palavras faladas, r = .69 em palavras invertidas, r = .89 em sons de objetos (p. 981)
- a frequência do pico espectral não teve associação significativa (p. 981)
- tons puros: r = .88; tons agudos com proporção de escolha pontuda de .87, contra .61 nos graves (p. 987)
- pronunciabilidade e formato da boca não previram o efeito (p. 976)

No PRD: fonte principal da linha 1.
Limite: sons curtos e isolados; 20 formas desenhadas no Paint.

### F15. Peeters, Giordano, Susini, Misdariis & McAdams (2011)

Peeters, G., Giordano, B. L., Susini, P., Misdariis, N. & McAdams, S. (2011). The Timbre Toolbox: extracting audio descriptors from musical signals. Journal of the Acoustical Society of America, 130(5), 2902-2916.
Arquivo: MULTISSENSORIAIS/03_Peeters_2011.pdf

O que traz:
- envelope de energia: amplitude do sinal analítico (Hilbert), com passa-baixa Butterworth de 3ª ordem a 5 Hz (p. 2904)
- STFT de referência do Toolbox: janela Hamming de 23,2 ms com avanço de 5,8 ms (p. 2904)
- início e fim do ataque pelo método "weakest effort", porque limiar fixo não é robusto em sons reais (p. 2906)
- log-attack-time = log10(fim do ataque − início do ataque) (p. 2907)
- a planura espectral pode ser calculada sobre várias representações (STFT, modelo ERB, harmônicos) (p. 2911)

No PRD: definições da etapa A; origem do descritor da linha 7.
Limite: é catálogo de descritores. Não sustenta nenhuma correspondência visual.

### F16. Spence (2011)

Spence, C. (2011). Crossmodal correspondences: a tutorial review. Attention, Perception, & Psychophysics, 73, 971-995.
Arquivo: MULTISSENSORIAIS/03_Spence_2011.pdf

O que traz:
- crianças pareiam som alto com forma grande aos 2 anos (Smith & Sera, 1992) (p. 975)
- altura–elevação é uma das correspondências mais robustas (p. 976)
- no experimento 4 de Marks (1987a), tom agudo acelerou a resposta a um "V" invertido e tom grave a um "U" invertido (p. 976)
- as correspondências de laboratório são majoritariamente relativas, não absolutas (p. 977)
- Evans & Treisman (2010): altura se associa a elevação, tamanho e frequência espacial, mas não a contraste (p. 978)
- sem correspondência observada entre altura e matiz azul/vermelho (Bernstein, Eason & Schurman, 1971), nem entre loudness e luminosidade (Marks, 1987a) (p. 978)
- Tabela 1 (p. 979), tarefas de classificação acelerada: tom agudo corresponde a mais alto, mais brilhante, mais claro, mais angular, menor, frequência espacial mais alta e movimento para cima; altura–contraste e altura–matiz sem efeito; som alto corresponde a mais brilhante, e loudness–luminosidade sem efeito
- Tabela 2 (p. 987): loudness–brilho é estrutural; altura–elevação, altura–tamanho e loudness–tamanho são estatísticas; altura–elevação e altura–frequência espacial também aparecem como semânticas; altura–brilho é difícil de classificar
- Stevens (1957) é citado para intensidade codificada por aumento de disparo neural, base possível de loudness–brilho, que é estrutural (p. 988)

No PRD: coluna "tipo"; linhas 1, 3 e 4; normalização relativa.

### F17. Sturm & Collins (2014)

Sturm, B. L. & Collins, N. (2014). The Kiki-Bouba Challenge: algorithmic composition for content-based MIR research and development. Proceedings of the 15th International Society for Music Information Retrieval Conference (ISMIR 2014), 21-26.
Arquivo: SONS PUROS/01_Sturm_2014_KikiBoubaChallengeMIR.pdf

O que traz: duas classes de música geradas por algoritmo, com resposta certa definida (Tabela 1):
- Kiki: accelerandos, ritmo livre e rápido, fades durante os accelerandos, sons percussivos com ataque e decaimento rápidos, brilhantes
- Bouba: coral estável, poucas durações e lento, dinâmica única, sons de ataque e decaimento lentos, com portamento e vibrato

No PRD: apoio parcial da linha 8 (em música, kiki também é densidade e rapidez de ataques). A conferência com o corpus fica para o volume 2.
Limite: as classes foram compostas pelos autores. É convenção, não resultado perceptual.

### F18. Winter (2025)

Winter, B. (2025). The size and shape of sound: the role of articulation and acoustics in iconicity and crossmodal correspondences. Journal of the Acoustical Society of America, 157(4), 2636-2656. doi 10.1121/10.0036362
Arquivo: SONS PUROS/01_Winter_2025_SizeShapeSoundAcoustics.pdf

O que traz:
- explicações só acústicas costumam bastar para o simbolismo sonoro; as articulatórias ficam supérfluas em muitos casos (p. 2636)
- relato de Fort & Schwartz (2022): formas redondas, ao rolar e bater, produzem sons mais graves e com menos modulação de amplitude; bouba também é mais grave e menos modulada que kiki (p. 2645-2646). Winter descreve os objetos como impressos em 3D; o artigo do Fort descreve, no experimento, brinquedos de plástico em forma de frutas e legumes (F06, p. 5). Na citação, use o original.
- tons agudos são pareados com formas angulares de forma consistente (p. 2646)
- a taxa de modulação de amplitude se associa à frequência espacial visual (Guzman-Martinez et al., 2012), e formas angulares têm frequência espacial mais alta (p. 2646)

No PRD: linha 5 (borda com harmônicos altos); motivo para trocar "analogia com plosivas" por fonte acústica na linha 2.

### F19. Zacharakis, Pastiadis & Reiss (2015)

Zacharakis, A., Pastiadis, K. & Reiss, J. D. (2015). An interlanguage unification of musical timbre: bridging semantic, perceptual and acoustic dimensions. Music Perception, 32(4), 394-412. doi 10.1525/mp.2015.32.4.394
Arquivo: SONS PUROS/An_interlanguage_unification_of_musical_2015.pdf

O que fizeram:
- teste de dissimilaridade com falantes de grego e de inglês, sobre 24 sons: 15 amostras de instrumento da biblioteca MUMS, uma flauta e 8 sons de sintetizador e eletromecânicos. Os primeiros 1,3 s de cada som, todos na classe de altura Lá, de 55 a 440 Hz (p. 396)
- descritores calculados com janela de 4096 amostras a 44,1 kHz, sobreposição de 87,5%, zero padding fator 2 e 50 parciais harmônicos (p. 402)
- quatro componentes acústicos por PCA com rotação varimax (Tabela 7, p. 404):
  - EDHP: tristimulus 3 (.96), centroide normalizado (.94), tristimulus 2 (−.93)
  - SDT: razão ímpares/pares (−.77), inarmonicidade (−.71)
  - STV: noisiness (.87), flux (.82), desvio-padrão do centroide (.72)
  - T/STV: log do tempo de ataque (.88), coeficiente médio de variação (.76), centroide temporal (.74)

O que encontraram (Tabela 8, p. 405), correlação entre componentes e eixos perceptuais, grego e inglês:
- 1º eixo: F0 (−.74 e −.63) e EDHP (.64 e .73)
- 2º eixo: T/STV (−.62 e −.65) e EDHP (−.60 e −.44)
- 3º eixo: SDT (−.66 e −.61), EDHP (−.41 e −.45) e F0 no grego (−.44)
- STV não se correlacionou significativamente com nenhum eixo (de −.10 a .26)

No PRD: coluna "eixo"; janela de análise; notas das linhas 5 e 7.
Limite: sons isolados de 1,3 s, com altura igualada.

### F20. Palmer, Schloss, Xu & Prado-León (2013)

Palmer, S. E., Schloss, K. B., Xu, Z. & Prado-León, L. R. (2013). Music–color associations are mediated by emotion. Proceedings of the National Academy of Sciences, 110(22), 8836-8841. doi 10.1073/pnas.1212562110
Arquivo: MULTISSENSORIAIS/03_Palmer_2013_MusicColorEmotion.pdf

O que fizeram: 48 participantes nos Estados Unidos e 49 no México ouviram 18 trechos de 50 s de música orquestral de Bach, Mozart e Brahms, variando andamento (lento, médio, rápido) e modo (maior, menor). Para cada trecho, escolhiam as cinco cores que mais combinavam e as cinco que menos combinavam, entre 37 cores: 8 matizes em 4 níveis de saturação e claridade, mais cinzas, branco e preto. Também avaliaram cada cor e cada trecho em oito termos de emoção (p. 8836-8837). Dois experimentos adicionais usaram rostos com expressão de emoção (p. 8839).
O que encontraram:
- música rápida e em modo maior puxou cores mais saturadas, mais claras e mais amarelas; lenta e em modo menor, cores menos saturadas, mais escuras e mais azuis (p. 8837)
- em modo maior, andamento lento puxou cores mais verdes (p. 8837)
- os resultados foram quase iguais nos dois países, com correlações de .88 a .97 entre eles por dimensão de cor (p. 8838)
- a emoção da música e a emoção das cores escolhidas se correlacionaram de .89 a .99 (p. 8836 e 8838)
- rostos calmos puxaram cores pouco saturadas, moderadamente claras e levemente frias; tristes, cores escuras, pouco saturadas e frias; alegres, cores claras, saturadas e quentes; com raiva, vermelhos escuros (p. 8839)
- os autores defendem uma classe de correspondência mediada por emoção, que Spence (2011) só mencionava como possibilidade (p. 8840)

No PRD: linha 6, cantos de cor, regras de eixo e tipo da linha 6.
Limite: só música orquestral clássica ocidental; raiva e calma não se comportaram como polos de uma mesma escala (p. 8838); participantes ocidentais.

### F21. Whiteford, Schloss, Helwig & Palmer (2018)

Whiteford, K. L., Schloss, K. B., Helwig, N. E. & Palmer, S. E. (2018). Color, music, and emotion: Bach to the blues. i-Perception, 9(6), 1-27. doi 10.1177/2041669518808535
Arquivo: MULTISSENSORIAIS/03_Whiteford_2018_ColorMusicEmotion.pdf

O que fizeram: 30 participantes ouviram 34 trechos instrumentais de 15 s, sem letra, de 34 gêneros (blues, salsa, heavy metal, jazz, funk, eletrônica, entre outros), e escolheram as três cores que mais combinavam e as três que menos combinavam, entre as mesmas 37 cores de F20. Avaliaram cores e trechos em 10 escalas ligadas a emoção; 15 músicos avaliaram os trechos em 15 características musicais, como volume, distorção e andamento (p. 3-8).
O que encontraram:
- características musicais se correlacionaram com a cor (música alta e marcada puxou cor mais saturada, mais vermelha e mais escura), mas essas correlações deixaram de ser significativas quando a emoção foi controlada (p. 10 e 14)
- duas dimensões latentes, excitação e valência, explicam a ligação (p. 15)
- excitação puxou cor mais saturada (.72), mais escura (−.55) e mais vermelha (.75); valência puxou cor mais clara (.48) e mais amarela (.47) (Figura 3c, p. 11)
- música agradável e harmoniosa puxou cores mais claras, pouco saturadas e levemente esverdeadas (p. 13)
- vermelho, laranja e amarelo saturados ficam em excitação e valência altas; cinzas e azuis escuros, nas duas baixas (p. 15); o quadrante de valência alta e excitação baixa reúne sobretudo cores claras (Figura 5a, p. 16, leitura da figura)
- música rápida puxou cor mais escura e mais vermelha, ao contrário do clássico de F20; os autores atribuem isso a que, nesse repertório, música rápida também era pesada e marcada (p. 12)
- o trecho de heavy metal puxou pretos e vermelhos escuros (p. 19)
- as duas dimensões de emoção explicaram em média 58% da variação da cor, contra 42,6% das duas dimensões de características musicais; por eixo: saturação 72,2%, luminosidade 68,3%, vermelho-verde 58,3% e amarelo-azul 33,3% (p. 18)

No PRD: linha 6, cantos de cor e regras de eixo; apoio conceitual ao uso de valência e excitação (seção 7), sem validar as estimativas do modelo escolhido.
Limite: 30 participantes nos Estados Unidos; trechos de 15 s; um trecho por gênero, escolhido e nomeado pelos autores (p. 6); direções medidas com paleta fixa de 37 cores.

### Fontes fora da pasta, citadas via outro artigo

Precisam ser lidas no original ou citadas com apud.

- Marks, L. E. (1987a). On cross-modal similarity: auditory–visual interactions in speeded discrimination. Journal of Experimental Psychology: Human Perception and Performance, 13, 384-394. Via F16, p. 976 e 979.
- Smith, L. B. & Sera, M. D. (1992). A developmental analysis of the polar structure of dimensions. Cognitive Psychology, 24, 99-142. Via F16, p. 975.
- Gallace, A. & Spence, C. (2006). Multisensory synesthetic interactions in the speeded classification of visual size. Perception & Psychophysics, 68, 1191-1203. Via F16.
- Evans, K. K. & Treisman, A. (2010). Natural cross-modal mappings between visual and auditory features. Journal of Vision, 10(1), 6, 1-12. Via F16, p. 978.
- Bernstein, I. H., Eason, T. R. & Schurman, D. L. (1971). Hue–tone interaction: a negative result. Perceptual and Motor Skills, 33, 1327-1330. Via F16, p. 978.
- Lipscomb, S. D. & Kim, E. M. (2004). Perceived match between visual parameters and auditory correlates: an experimental multimedia investigation. Proceedings of the 8th International Conference on Music Perception and Cognition, 72-75. Via F05, p. 2, e F11, p. 3.
- Hauck, P. & Hecht, H. (2019). The louder, the longer: object length perception is influenced by loudness, but not by pitch. Vision, 3(4), 57. Via F05, p. 2. Mede comprimento, não tamanho.
- Vroomen, J. & Keetels, M. (2010). Perception of intersensory synchrony: a tutorial review. Attention, Perception, & Psychophysics, 72(4), 871-884. Via F05, p. 3.
- Guzman-Martinez, E., Ortega, L., Grabowecky, M., Mossbridge, J. & Suzuki, S. (2012). Interactive coding of visual spatial frequency and auditory amplitude-modulation rate. Current Biology, 22(5), 383-388. Via F18, p. 2646.
- Glasberg, B. R. & Moore, B. C. J. (1990). Derivation of auditory filter shapes from notched-noise data. Hearing Research, 47(1-2), 103-138. Via F09, p. 2770. Origem da fórmula da ERB-rate.
- Sethares, W. A. (1993). Local consonance and the relationship between timbre and scale. Journal of the Acoustical Society of America, 94(3), 1218-1228. Via F10. Origem do descritor de aspereza.
- Plomp, R. & Levelt, W. J. M. (1965). Tonal consonance and critical bandwidth. Journal of the Acoustical Society of America, 38, 548-560. Via Wallmark (2014). Origem psicoacústica da curva de dissonância; não trata de visão.
- Giannakis, K. (2006a). A comparative evaluation of auditory-visual mappings for sound visualisation. Organised Sound, 11, 297-307. Via F01, p. 1-2. Compacidade do som com granularidade visual; possível âncora futura da linha 7.

### Referências retiradas da versão 1

- Stevens (1957), da linha de RMS: trata de loudness–brilho, não de tamanho (F16, p. 988).
- Sievers et al. (2013), da linha de onset: não aparece em nenhum artigo da pasta e não trata de segmentar som em formas.
- "Analogia com plosivas", da linha de ataque: contradiz a base acústica do trabalho (F06, F18).
- "Descritor acústico padrão", da linha de planura: indica a origem do número, não a correspondência.
- Adeli et al. (2014) e Marks (1987), como fontes de centroide → cor: Adeli não mede centroide; Marks não sustenta matiz (F16, p. 978).
