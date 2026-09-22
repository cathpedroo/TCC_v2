# PRD: A forma do som — protótipo v2

Protótipo de visualizador de som instrumental baseado em correspondências crossmodais.
Documento de especificação para desenvolvimento assistido.

Versão 6.0, 22 de setembro de 2026. **A forma do v2 está fechada** (seção 10): a 6.0 corrige o transbordo da angularidade, que somava um valor fixo a duas janelas de larguras diferentes e deixava a forma grave mais pontuda que a média-aguda em 2% dos quadros (seção 5), fecha a pendência P7 com a assimetria medida, registra a decisão de não construir o modo microfone agora (P5), e corrige dois critérios de aceite que tinham deixado de medir o que pretendiam. Estado congelado em `protótipo_v2/historico/20260922-forma-v2-fechada/`. A 5.0 foi a primeira versão do protótipo v2. A 4.1 fecha a pendência P1: a angularidade passa a ser um parâmetro contínuo numa escala absoluta compartilhada, e círculo e triângulo deixam de ser identidades declaradas. A 4.2 tira os controles manuais de geometria: a tela mostra o que a música causa, não o que a mão ajusta (seção 7). A 4.3 corrige o nome do eixo y (é brilho, não altura de nota), acrescenta as travas de silêncio e de ataque falso vindas do estudo do StrumSurfer, e fecha as pendências P4 e a do estado de repouso. A 4.4 acrescentou a expansão calibrada da régua de angularidade, depois de medir que a régua linear fazia a correspondência com mais apoio do projeto ser a menos visível na tela. A 5.0 fecha a pendência P3 com as duas disposições implementadas, incluindo a sobreposição. A 4.8 fecha o perfil da ponta, aprovado pela autora. A 4.7 leva o eixo x para a régua absoluta compartilhada e registra três bugs de medição encontrados assistindo (seção 6). A 4.6 registra o achado do evento não capturado (seção 6). A 4.5 registra a etapa 1 construída e tudo que foi decidido ao desenhar a forma: o vocabulário de espícula, a contagem de pontas derivada da calibração, o ataque no agudo medido e recusado, os números de composição, e o transbordo da angularidade nos picos de brilho. Versões anteriores em `protótipo_v2/historico/20260918-antes-v2/`. Muda o que o protótipo é: duas formas separadas, cada uma ouvindo uma faixa de frequência, reagindo ao som **enquanto ele acontece**. A versão anterior, que descrevia o v1 (fluxo simétrico, análise prévia em JSON, forma única contínua), está em `protótipo_v2/historico/20260918-antes-v2/PRD-antes.md` e continua valendo para o que já foi construído em `protótipo_v1/`.

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

### Como o registro é resolvido, decidido em 18/09/2026

Sem modo de acúmulo. Três caminhos separados, cada um para o que precisa:

| para quê | como | por quê |
|---|---|---|
| performance | gravação de tela em tempo real, `MediaRecorder` | ao vivo, é a única opção possível (`referencia-prototipo-ao-vivo.md`, seção 9) |
| **figuras da monografia** | captura de quadro em instantes escolhidos, **no modo arquivo** | o modo arquivo é determinístico (aceite, critério 5): o quadro dos 22 s é sempre o mesmo quadro. É esta a peça que resolve o problema, e ela já sai de graça do que o v2 tem |
| registro do percurso | fica sendo contribuição do **v1** | o v1 registra a sequência, o v2 reage ao presente. São duas perguntas diferentes, e ter as duas é mais forte que ter uma |

Não construir modo de acúmulo no v2: seria um terceiro sistema para manter e briga com a premissa do ao vivo.

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
| início | o motor de áudio é criado ou retomado **dentro do clique** do botão | o navegador não libera som antes de um gesto da pessoa |
| simulação | passo fixo de 1/60 s, quantos couberem no tempo real decorrido | senão uma tela de 120 Hz dobra a velocidade de tudo (armadilha do TypePulse) |

**Atenção ao filtro de entrada.** A referência sugere passa-alta em 55 Hz contra ruído de mesa (StrumSurfer). **Não use 55 Hz neste material.** O pico mais grave do áudio de teste é 44,3 Hz = Fá1, e ele é a nota mais grave de todo o trecho depois dos 22 s (`leitura-audio-prototipo.md`). Um corte em 55 Hz apagaria exatamente o evento estrutural da peça. Use **30 Hz**, que é o piso da faixa grave declarada, e aceite algum ruído de manuseio.

### Duas travas sem as quais a imagem mente

Vieram do estudo do StrumSurfer (17/09/2026) e não estavam no v1.

**Piso de silêncio e confiança no brilho.** O centroide é uma divisão pela energia da faixa. Quando a faixa está quase muda, essa conta é ruído, e a forma tremeria em distribuição y e em angularidade sem nenhum som causando. Isso **vai** acontecer neste material: a faixa média-aguda está 9,2 dB abaixo da mistura (`faixas.md`). Nas medições de 18/09 foi preciso descartar os quadros abaixo do percentil 20 de energia para os números fazerem sentido.

Então: cada leitura de brilho sai acompanhada de um número de **confiança**, derivado da energia da faixa em relação ao piso fixado na calibração. Abaixo do piso, a forma **segura o último valor válido** em vez de seguir lixo, e o painel de leitura marca a medida como indisponível. Nunca interpolar para zero: zero de energia não quer dizer brilho zero, quer dizer brilho desconhecido.

**Trava de ataque falso.** O detector de ataque exige três condições juntas, não uma: novidade acima do limiar adaptativo, **pelo menos 15% das faixas da banda subindo no mesmo salto**, e o período refratário de 110 ms. A do meio é a que faltava. Sem ela, um único harmônico subindo dispara um ataque que não existe — e a forma grave é metade do protótipo.

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

### Calibração

**No modo arquivo ela é automática.** A página lê a faixa inteira antes de desenhar e mede sozinha os limites de brilho de cada banda, o piso de silêncio, os pontos de quebra da régua de angularidade e a contagem de pontas. Cada faixa que se sobe calibra a si mesma, e os valores aparecem no painel. Conferido em 20/09 contra a medição em Python: mesmas 1.689 leituras, brilho grave 62–172 Hz (Python: 55–170), 60 ataques contra 62.

**No modo microfone ela precisa ser tocada antes**, porque ali não se conhece o futuro:

Uma etapa curta antes da performance, inspirada no StrumSurfer:

1. Silêncio por 2 s: mede o ruído da sala e fixa o piso de cada faixa.
2. Toca-se o instrumento por ~10 s: fixa a escala de amplitude e de brilho daquele instrumento naquela sala, **e os pontos de quebra da régua de angularidade** — onde o brilho de cada faixa realmente se concentra naquele material (seção 5).
3. Os valores ficam visíveis e editáveis no painel; dá para pular a calibração e usar os padrões.

---

## 5. Tabela de mapeamento do v2

Esta tabela é o coração do projeto. Cada linha deve aparecer como comentário no código, ao lado da função que a implementa, com o código da ficha (F01, F02...) e a referência curta. A ficha completa de cada fonte está no anexo, seção 12.

Colunas: **tipo** é a classificação de Spence (2011, Tabela 2, p. 987): estrutural, estatística ou semanticamente mediada. **Regime** é verificável quando há resposta publicada para conferir, propositivo quando é decisão de projeto declarada.

| # | o que se mede | em qual forma | parâmetro visual | direção | fontes | tipo | regime |
|---|---|---|---|---|---|---|---|
| V1 | energia da faixa 350–6.000 Hz, envelope lento | médio-aguda | extensão no eixo x | mais forte, mais se distribui pelas extremidades x | Smith & Sera 1992 via F16; Lipscomb & Kim 2004 via F05 e F11; precedente em F05 | estatística | apoio indireto; o eixo x como medida de amplitude é decisão da autora (PDF, pág. 3) |
| V2 | centroide espectral dentro de 350–6.000 Hz, em log2 | médio-aguda | distribuição no eixo y: centro ↔ extremidades, excursão limitada a 30% do campo | mais brilhante, mais vai para as extremidades y | F16 Spence 2011; F04 Eitan & Granot 2006; F08 Küssner & Leech-Wilkinson 2014 | estatística e semântica | **propositivo, e uso substituto.** Ver a ressalva do eixo y, abaixo |
| V3 | fluxo espectral positivo em 30–220 Hz | grave | nascimento e força do acento | acima do limiar, a forma grave é empurrada | decisão de projeto; apoio parcial em F02, F05 e F17 | não se aplica | propositivo |
| V4 | energia da faixa 30–220 Hz | grave | extensão no eixo x | mais forte, mais se distribui pelas extremidades x | mesmas de V1 | estatística | apoio indireto |
| V5 | centroide espectral dentro de 30–220 Hz | grave | distribuição no eixo y, mesma excursão limitada | mais brilhante dentro do grave, mais para as extremidades y | mesmas de V2 | estatística e semântica | propositivo, e uso substituto |
| V6 | centroide espectral em log2, numa **escala absoluta compartilhada pelas duas formas** | as duas | angularidade: quantidade de pontas do contorno, de sem ponta a pontuda | mais agudo, mais pontudo | F14 Passi & Arun 2022; F06 Fort & Schwartz 2022; Marks 1987a via F16 | estatística | **verificável.** É a linha com mais apoio do projeto; ver abaixo |

Aspereza, planura, F0, posição vertical assinada e cor por emoção **não entram no v2**.

### Ressalva do eixo y: um remendo declarado, e por que ele é menor que as pontas

São duas coisas erradas no mesmo eixo, e as duas precisam estar no texto.

**Primeira: o descritor é substituto.** A correspondência com apoio é **altura de nota** → posição vertical, a mais replicada de todas as que o projeto usa (F16, p. 976). Mas altura de nota não é mensurável nesta música: a fundamental foi detectada com confiança em **0,089% dos quadros** (`leitura-audio-prototipo.md`). O centroide entra no lugar dela. Centroide é brilho de timbre; F16, F04 e F08 não mediram brilho, mediram altura. O apoio citado vale para a ideia, não para o descritor usado.

**Segunda: a simetria não tem fonte.** Altura → elevação é um eixo **com sinal**: agudo em cima, grave embaixo. O PDF da autora pede agudo para **as duas** extremidades e grave no centro. Isso contém o "agudo em cima" mais o seu espelho, e nenhuma fonte mede o espelho. É decisão formal, a mesma que o v1 já tinha tomado no fluxo simétrico, e **não constitui validação da correspondência perceptual de "agudo em cima"**.

**Consequência de projeto: o eixo y ganha excursão menor que a angularidade.** O centroide move duas coisas neste protótipo — a distribuição em y (V2, V5) e a angularidade (V6) — e, sendo a mesma medida, as duas andam em trava. O PRD do v1 já avisava: se o mesmo descritor mover tudo, os canais deixam de ser distinguíveis na tela.

Como não há um terceiro descritor disponível, a saída é desequilibrar a favor de onde existe evidência:

| onde o centroide age | apoio | excursão |
|---|---|---|
| angularidade (V6) | F14, r = .88 e .89, com o próprio descritor | **cheia**, de sem ponta a pontuda |
| distribuição em y (V2, V5) | substituto de um descritor que não se pode medir, e em versão simétrica sem fonte | **até 30% do campo** |

O brilho se expressa principalmente como pontas, que é onde a evidência está, e secundariamente como distribuição vertical, que é remendo. O v1 tinha chegado a algo parecido limitando a posição vertical a 28% da altura. O valor exato fica no arquivo de configuração.

**O que não é problema:** volume e brilho são canais independentes. Medição de 18/09 dentro da faixa média-aguda: r = 0,08. Os eixos x e y vão se mover um sem o outro de verdade; a trava é só entre y e as pontas.

**Por que o volume não entra na angularidade:** não há fonte. Passi & Arun mediram frequência → pontudez (F14). Ninguém ligou volume a pontudez. O que existe para volume é loudness → brilho (Stevens 1957, via F16, p. 988) e loudness → tamanho, com apoio apenas indireto e com tensão declarada, já que tom grave puxa objeto grande (F13; F16, Tabela 1). Misturar volume na angularidade sujaria o único resultado forte do projeto em troca de nada.

### A angularidade é contínua, e a identidade emerge

Esta é a ligação com **mais** apoio do projeto inteiro. Passi & Arun obtêm r = .88 entre a frequência média do espectro e a escolha da forma pontuda em tons puros, e r = .89 em sons de objetos reais; a frequência do **pico** espectral não prevê nada, é o centroide mesmo (F14). Fort & Schwartz dão o mecanismo físico (F06).

Duas consequências para o desenho.

**O parâmetro é contínuo, não categórico.** Passi & Arun mediram pontudez ao longo de uma escala, não uma escolha entre dois polígonos nomeados. O círculo e o triângulo do PDF da autora (pág. 5) são **as duas pontas dessa escala**, não duas formas distintas. O contorno é um só, com um parâmetro de angularidade que vai de sem ponta a pontuda. Desenhar literalmente um círculo e um triângulo aplicaria a fonte de forma mais pobre do que ela permite.

**A escala é absoluta e compartilhada pelas duas formas.** As duas leem o mesmo centroide na mesma régua em Hz, não cada uma normalizada dentro da própria faixa. Medição de 18/09/2026 sobre `audio-prototipo.mp3`, régua de 55 Hz a 2.913 Hz (5,73 oitavas):

| forma | brilho medido (p5–p95) | angularidade resultante |
|---|---|---|
| grave, 30–220 Hz | 55 a 170 Hz | **0,00 a 0,28** — fica redonda, e respira |
| médio-aguda, 350–6.000 Hz | 855 a 2.913 Hz | **0,69 a 1,00** — fica pontuda, e respira |

As duas nunca se cruzam, e cada uma ainda varia 1,6 a 1,8 oitava dentro do seu trecho. A forma grave é redonda **porque o grave é grave**, não porque o projeto declarou que grave é círculo. A identidade das duas formas deixa de ser legenda e passa a ser resultado de medida — que é o que a banca vai querer ver.

**A armadilha a evitar:** normalizar o brilho dentro de cada faixa separadamente. Cada forma usaria a escala de 0 a 1 inteira e o movimento ficaria mais dramático, mas um grave de 170 Hz apareceria tão pontudo quanto um agudo de 2.913 Hz. Isso inverte o achado de F14. A régua é uma só.

**Mas a régua linear precisa de uma expansão, e isto foi medido.** Com a régua linear de 55 a 2.913 Hz, o par de brilho de `pares-verificacao/` (1.076 Hz contra 2.397 Hz, mais que o dobro) move a angularidade em apenas **0,20** num parâmetro que vale de 0 a 1. A faixa grave varia 0,22 e a média-aguda 0,17. Ou seja: a correspondência com mais apoio do projeto seria a menos visível na tela.

A causa não é um buraco na régua. Entre as duas faixas há de fato uma região morta de 220 a 350 Hz que nenhuma forma lê, mas ela ocupa só cerca de 12% da régua. O resto do vão — de 170 a 855 Hz — é frequência legítima, que **esta gravação simplesmente não usa**. O limite é outro: cada faixa ocupa 1,6 a 1,8 oitava de uma régua de 5,7 oitavas, então cada forma usa cerca de um quarto dela. Isso é inerente a qualquer régua absoluta larga o bastante para cobrir as duas faixas.

**Solução: uma curva monótona que expande as duas janelas realmente ocupadas e comprime o vão entre elas.** Medição de 18/09/2026:

| régua | variação da forma grave | variação da média-aguda | folga entre elas | par de brilho |
|---|---|---|---|---|
| linear, 55–2.913 Hz | 0,22 | 0,17 | 0,50 | 0,20 |
| quebrada nas bordas das faixas (30/220/350/6000 Hz) | 0,16 | 0,13 | 0,39 | 0,15 |
| **expansão calibrada, 0,35 para cada** | **0,35** | **0,35** | **0,22** | **0,36** |

A segunda linha fica registrada porque foi tentada e **piorou**: quebrar a régua nas bordas das faixas alarga a régua para 30–6.000 Hz e dá a cada faixa uma fatia menor ainda. Expandir tem de ser feito onde o som está, não onde a faixa termina.

Recomendação: **expansão calibrada com 0,35 para cada forma**. Dobra a variação das duas, mantém 0,22 de folga entre elas, e deixa margem nos extremos (nenhuma chega a 0 ou a 1) para material mais escuro ou mais brilhante que este.

O que a curva preserva, e por isso F14 continua valendo: ela é **monótona** — mais agudo continua mais pontudo, sem exceção — e **absoluta** — a mesma frequência dá sempre a mesma angularidade, em qualquer das duas formas. A forma grave continua estruturalmente abaixo da média-aguda.

O que a curva custa, e precisa estar no texto: os pontos de quebra vêm de **onde o conteúdo desta gravação está**, medidos nela. A régua deixa de ser independente do material. Para outra gravação, os pontos precisam ser medidos de novo — e é por isso que eles entram na calibração (seção 4), ao lado do piso de silêncio e da escala de amplitude. É uma transformação propositiva a mais, declarada.

**Por que isso faltou no v1, registrado para o texto:** desde 16/09/2026 o modo padrão do v1 era o fluxo simétrico, e `protótipo_v1/visual/fluxo-simetrico.js` não desenha angularidade — nenhuma menção no arquivo. Ali a forma é uma fita cuja **espessura** varia, e o brilho entrava só como altura (`alturaAgudosMin + alturaAgudosBrilho × brilho`): mais brilho deixava a fita mais alta, nunca mais pontuda. Os números existiam: nos 73 eventos de `protótipo_v1/analise/saida/dados.json` a angularidade vai de 0,048 a 0,978, quase a escala inteira. Foi calculada, foi gravada e não chegou à tela. A ausência percebida pela autora é de implementação, não da correspondência.

### Picos de brilho transbordam a régua, decidido em 20/09/2026

A autora ouviu, na faixa média-aguda isolada, um "gritinho" recorrente e perguntou se as pontas não poderiam saltar nele. Medido: **é pico de brilho, não ataque.** Nesses instantes o centroide pula da mediana de 1.449 Hz para cerca de **2.920 Hz**, enquanto a energia muitas vezes está no máximo (−1,8 dB). Nada é golpeado; o espectro inteiro sobe. São 33 picos em 39,3 s, com intervalo mediano de **1,04 s**.

Como brilho já é o que move as pontas (V6), o evento **já estava no mapeamento**. Não entrou linha nova na tabela.

**Primeira tentativa, registrada porque falhou:** acelerar a subida da suavização do brilho de 60 para 15 ms. Medido na página, a mediana da angularidade foi de 0,78 para 0,81 e o tremor subiu de 0,029 para 0,037. Quase nada, em troca de mais vibração.

**A causa real:** a calibração fixa o topo da janela de cada faixa no **percentil 95** do brilho — e o gritinho é justamente o topo dos 5%. O teto estava na altura exata dos picos, e eles eram esmagados contra ele.

**Solução: a angularidade transborda.** Acima do topo da janela da sua forma ela não é travada; sobe além dele. A régua é calibrada pelo **corpo** da música (percentis 5 e 95); um pico é exceção e precisa parecer exceção.

**Correção de 22/09 — quanto ela pode transbordar.** A primeira versão somava um valor fixo: até +0,45 na angularidade, igual para as duas formas. O número era absoluto e as janelas não são. A janela do grave mede 0,27 na régua (0,05–0,32) e a da média-aguda mede 0,33 (0,45–0,78), de modo que o mesmo bônus valia **1,7 vez a faixa inteira do grave** e 1,4 vez a da outra. Medido na faixa completa, com o som acima do piso:

| | antes | depois |
|---|---|---|
| angularidade máxima do grave | 0,773 | 0,454 |
| percentil 99 do grave | 0,683 | 0,411 |
| quadros do grave acima do próprio teto (0,32) | 22,0% | 14,6% |
| quadros em que o grave fica mais pontudo que a média-aguda | 2,0% | **0%** |
| menor distância entre as duas angularidades | negativa | **+0,101** |

O grave chegava a 0,773 — o teto **normal** da outra forma — e a ultrapassava em 2% dos quadros. A afirmação que estava escrita aqui, de que "a forma grave continua sempre abaixo da média-aguda", tinha deixado de ser verdadeira no código.

Não era o limiar do pico que estava errado: as duas bandas saltam quase o mesmo em oitavas sobre a própria base (percentil 90 de 0,54 no grave e 0,44 na média-aguda). Era a soma que era grande demais para a janela do grave.

**Regra nova, uma só para as duas:** o transbordo gasta no máximo a **distância até a próxima região ocupada da régua** — ou até o fim dela, se não houver nenhuma acima. O pico alcança a fronteira da outra forma e nunca a cruza. Os dois orçamentos saem da calibração, não de gosto: neste áudio, 0,13 para o grave (a folga entre as janelas, que a própria tela já exibe) e 0,22 para a média-aguda.

O transbordo é decisão de projeto, declarada. Ele não muda a direção nem a ordem — mais brilho continua mais pontudo, e a forma grave continua abaixo da média-aguda —, só devolve aos picos a altura que a normalização tirava. `transbordoDaFolga = 0` desliga.

**Hipótese testada e recusada.** Antes de mexer na aritmética, levantei que o transbordo do grave estivesse medindo o mesmo evento que o detector de ataque — o transiente do bumbo —, o que seria contar duas vezes. Não se sustentou: dos 17 disparos de transbordo no grave, 6 caem a menos de 120 ms de um ataque, contra 4,2 esperados por acaso (as janelas de ±120 ms cobrem 24,6% dos quadros com som). Com 17 eventos isso não é associação. O achado colateral foi o oposto e esse sim é limpo: o transbordo da média-aguda cai **zero** vez junto de um ataque grave, contra 4,4 esperados — ele é evento de outra banda, como o projeto supõe.

### Sobre a honestidade da tabela

Três ressalvas que devem constar como comentário no código e no texto:

A ligação entre frequência e forma pontuda tem apoio direto com o próprio centroide (F14) e mecanismo físico (F06), mas foi medida em **sons curtos e isolados**, não em mistura polifônica contínua.

A distribuição simétrica no eixo y e a extensão no eixo x por amplitude são decisões de projeto da autora, com apoio apenas indireto e parcial.

Tudo o que o protótipo faz com música contínua e polifônica é extensão propositiva. As fontes não validam a combinação específica aplicada aqui à mistura. **Dividir por faixa de frequência não valida separação de fontes por este algoritmo.**

---

## 6. Como cada forma se comporta

### Base geométrica, comum às duas

Cada forma vive num sistema de eixos próprio, com centro fixo, conforme o PDF `comportamento da forma.pdf`:

- **Eixo x — amplitude.** Quanto maior a energia da faixa, mais a forma se distribui pelas extremidades do eixo x (PDF, pág. 3). Silêncio deixa a forma recolhida perto do centro; som forte a espalha na horizontal. A energia é lida numa **régua absoluta compartilhada pelas duas formas**, construída na calibração como a da angularidade: a faixa mais forte fica mais larga na tela. Normalizar dentro de cada faixa — como era até 21/09 — deixava as duas formas sempre da mesma largura e apagava a diferença entre elas, que nesta gravação é de 8 dB.
- **Eixo y — brilho do timbre.** Quanto mais escuro o som, mais a forma se acumula no centro; quanto mais brilhante, mais ela vai para as extremidades do eixo y (PDF, pág. 4). **Atenção ao nome:** o desenho da autora fala em grave e agudo, ou seja, altura de nota, mas o que move este eixo é o **centroide espectral, que é brilho de timbre, não altura**. Uma nota grave com timbre brilhante sobe. É a armadilha que o TypePulse comete ao chamar o centroide de "Pitch" (`referencia-prototipo-ao-vivo.md`, seção 10). O v1 declarava isto e o texto do v2 precisa declarar de novo: **não é F0, não é transcrição de notas.** Por que não se usa a altura de verdade, e o que isso custa, está na ressalva do eixo y, na seção 5.
- **O centro nunca se desloca.** A forma se expande e se recolhe em torno dele, nos dois sentidos de cada eixo.
- **Angularidade — as pontas** (PDF, pág. 5). Um contorno só, com um parâmetro contínuo entre sem ponta e pontuda, lido do centroide na escala absoluta compartilhada (V6). Na prática a forma grave fica no trecho redondo da escala e a média-aguda no trecho pontudo, sem que isso precise ser declarado. O círculo e o triângulo do PDF são as duas pontas dessa escala.

Os dois eixos são independentes: uma forma pode ficar larga e baixa (forte e escura) ou estreita e alta (fraca e brilhante).

### Como a ponta é desenhada, decidido em 20/09/2026

**O corpo é sempre uma elipse; as pontas entram como relevo por cima dela.** A construção anterior interpolava a silhueta inteira entre elipse e polígono, e isso misturava duas coisas que precisam ser separadas: quanto o corpo é redondo (global) e quão afiada é cada ponta (local). O resultado era um borrão globalmente triangular no grave e um polígono de vértices moles no agudo. A separação foi pedida pela autora.

Dois parâmetros, ambos crescendo com a angularidade medida, na mesma régua compartilhada:

- **relevo** — o quanto a ponta sai do corpo
- **nitidez** — a curva da ponta, de morro largo a agulha estreita

Como a forma grave vive na parte baixa da régua e a média-aguda na alta, uma fica com picos macios e a outra com pontas afiadas, sem que isso precise ser declarado por forma.

**Dois defeitos geométricos foram encontrados e corrigidos, nesta ordem**, e ficam registrados porque cada um só apareceu depois de corrigir o anterior:

1. *As pontas seguiam o ângulo, não o perímetro.* Numa forma achatada, ângulo igual não é distância igual numa elipse: os picos se amontoavam nos extremos do eixo menor e sumiam nas laterais. Passaram a ser distribuídos por comprimento de arco.
2. *O relevo saía pelo raio, não pela normal do contorno.* Nas pontas do eixo maior a direção radial é quase horizontal, então o relevo esticava o comprimento em vez de formar pico — por isso, mesmo depois da primeira correção, os picos só apareciam no meio. Passou a sair perpendicular à borda, em qualquer ponto dela.

**O formato da ponta depende da angularidade, não só o tamanho.** Aprovado pela autora em 21/09/2026.

A primeira versão fazia a angularidade controlar apenas *quanto* a ponta saía do corpo. Como o perfil era uma tenda — queda linear —, ela terminava num bico **por construção**, e a forma grave ficava com agulhas curtas em vez de ondulações. A autora apontou isso olhando a tela.

Agora o perfil interpola entre dois extremos, pela mesma régua compartilhada:

| onde a forma está na régua | perfil |
|---|---|
| abaixo de **0,38** | morro de cosseno, derivada zero no topo — arredondado |
| acima de **0,72** | agulha de base larga, com bico |
| entre os dois | mistura dos dois |

E o relevo deixou de crescer em linha reta: cresce com **angularidade^1,7**. O expoente segura o relevo na parte baixa da régua sem achatar a parte alta.

Como a forma grave vive em ~0,05–0,32 e a média-aguda em ~0,45–0,78, a separação acontece sozinha: a grave sai com ondulações rasas e largas, a média-aguda com agulhas. **Nada precisou ser declarado por forma** — as duas leem a mesma régua, e é a posição de cada uma nela que produz a diferença.

Os quatro números (`bicoDe`, `bicoAte`, `relevo.curva`, `espicula.larguraMax`) são decisão de composição, escolhidos olhando a tela, e estão no arquivo de configuração.

**Vocabulário da ponta: espícula.** O perfil é uma agulha de base larga afinando até a ponta, com uma segunda escala fina por cima, e não um morro de cosseno. A escolha veio de referências visuais trazidas pela autora — radiolárias e formas espinhosas. Nenhuma fonte descreve a aparência da forma: F14 prende apenas a direção (mais brilho, mais pontudo, de forma monótona), e todo o resto do vocabulário é decisão de projeto. O perfil de morro continua disponível na configuração (`relevo.perfil`).

A segunda escala fina é multiplicada pela angularidade. Sem isso ela fica na mesma escala das pontas da forma grave e a contagem deixa de ser legível.

**A simetria é decisão de desenho, não resultado de medida.** Cada forma recebe três escalares — energia, brilho, ataque — e um escalar não tem lado. A simetria bilateral vem da elipse e a rotacional vem de os lobos serem idênticos e igualmente espaçados; nada na análise obriga nenhuma das duas. Ver a pendência P7.

### Quantas pontas, e de onde sai o número

A contagem **não é escolhida à mão**. Sai de onde cada faixa vive na régua compartilhada, medido pela calibração:

```
pontas = arredonda(pontasMin + (pontasMax − pontasMin) × posição média da faixa na régua)
```

Com `pontasMin = 5` e `pontasMax = 9`, o `audio-prototipo.mp3` dá **6 pontas na forma grave e 8 na média-aguda**. Outra gravação recalcula sozinha.

O piso de 5 é decisão de composição: com 4 pontas e um vértice no topo, as pontas da forma grave caíam exatamente sobre os eixos da elipse e ela lia como um losango.

O número é calculado **uma vez por faixa**, na calibração, e não muda durante a reprodução: contagem é número inteiro e mudaria aos saltos.

**Apoio e limite.** Nenhuma fonte mediu *quantidade* de pontas — F14 mediu uma escolha entre formas desenhadas. Mas mais pontas e pontas mais afiadas empurram a mesma qualidade perceptual, frequência espacial alta no contorno, que o projeto já cita em F18 (p. 2646). A contagem vai na mesma direção do efeito medido sem ser a variável medida: é propositiva, e declarada. O que se ganha em relação a um número fixo é que ela deixa de ser gosto congelado e passa a sair de medida.

### A forma dos médios-agudos: leitura sustentada

Ouve 350 a 6.000 Hz. Responde ao que **se mantém**, não ao que bate.

- Extensão em x: envelope lento da energia da faixa, suavização causal de **140 ms**.
- Distribuição em y: centroide dentro da faixa, em log2, suavização causal de **180 ms**, escalado entre limites fixos da faixa.
- Sem nascimento, sem acento, sem evento. É um gesto contínuo que engrossa e afina.
- Em silêncio, recolhe-se ao repouso, sem sumir.

A suavização longa é o que produz a sensação de "sustentado", e é também a origem do atraso de ~200 ms. As duas coisas são a mesma coisa; não dá para ter uma sem a outra.

### A forma dos graves: ataques

Ouve 30 a 220 Hz. Responde ao que **bate**, não ao que se mantém.

- Detecção: fluxo espectral positivo dentro da faixa, com as **três travas juntas** — limiar adaptativo sobre a média e o desvio dos últimos 2 s, pelo menos **15% das faixas da banda** subindo no mesmo salto, e período refratário de **110 ms** (seção 4).
- Cada ataque aceito dá um empurrão: subida de **25 ms**, queda de **220 ms**. O empurrão soma extensão em x e em y sobre o valor de repouso.
- Entre ataques, a forma volta ao repouso, que segue a energia lenta da faixa (V4) e o centroide da faixa (V5).
- Ataques sobrepostos somam. Não se cancelam nem reiniciam a queda.

**Medição feita em 18/09/2026** sobre `audio-prototipo.mp3`, com este detector: **62 ataques em 39,3 s (1,6 por segundo)**, intervalo mediano de 650 ms entre eles, mínimo de 116 ms. Com o acento de 220 ms, **23% dos pares seguidos ficariam sobrepostos** — ou seja, a maior parte dos impactos vai aparecer isolada e legível, com pares ocasionais. A duração de 220 ms está adequada a este material e não precisa ser reduzida.

Cuidado: o número de 248 ataques (6,3 por segundo) do relatório `leitura-audio-prototipo.md` é de **outra medida** — ataques do espectro inteiro, com o detector do librosa, com contexto de futuro. Não compare os dois números; eles medem coisas diferentes.

### O que as formas fazem no silêncio

**Nada inventado.** As duas recolhem ao mínimo e ficam paradas. O que mostra que o sistema está vivo é o painel de leitura, com o piso de ruído andando, mais um indicador discreto de "ouvindo" que é claramente interface e não forma.

A razão vem da regra da seção 2: nenhum efeito visual que não esteja na tabela. Uma respiração lenta no silêncio ficaria bonita e seria a primeira coisa que a banca apontaria — que som causou aquele movimento? Não haveria resposta. O StrumSurfer pode inventar um estado de repouso depois de 6 s sem som porque é um jogo; aqui o protótipo é um argumento sobre correspondência, e movimento sem causa sonora é um furo nele.

Silêncio na tela é resultado honesto: quer dizer que não há som. Escrever assim no texto.

### Ataque na faixa média-aguda: medido e recusado

Considerado em 20/09/2026, a pedido da autora, e **não adotado**. Fica registrado porque a medida existe e pode servir a uma versão futura.

Medição sobre `audio-prototipo.mp3`, com o mesmo detector causal aplicado a 350–6.000 Hz:

| | |
|---|---|
| ataques médio-agudos | 76 em 39,3 s (1,9/s) |
| que coincidem com um ataque grave (até 60 ms) | 25% |
| correlação entre os dois fluxos | 0,06 |
| variação da densidade em janelas de 3 s | 1,3 a 2,3 /s |

Três em cada quatro ataques do agudo não têm par no grave: é um terceiro canal independente, não um eco.

**Por que não entrou.** A assimetria é a ideia do v2, não uma divisão arbitrária de trabalho: o grave é ouvido como impacto e o agudo como linha. Se as duas formas passam a mostrar energia, brilho e ataque da sua faixa, a diferença entre elas vira apenas *qual faixa*, e não *que tipo de escuta* — e o protótipo se aproxima de um mostrador de duas bandas. Um acento de ataque na forma média-aguda contradiz diretamente o que ela é. Além disso, a independência que justifica as duas formas existirem (r = −0,08, aceite critério 1) é medida exatamente entre ataque grave e brilho médio-agudo.

**Por que também não serviria para a contagem de pontas**, que era a pergunta original: a densidade de ataques varia só de 1,3 a 2,3 por segundo, o que moveria a contagem em duas ou três unidades, devagar, ao longo de segundos. Leria como deriva lenta, não como reação a ataque.

### Um evento que os descritores não capturam, 21/09/2026

Este é um resultado negativo, e ele vale mais que um ajuste bem-sucedido. Precisa entrar no texto da monografia.

**O que aconteceu.** Ouvindo a faixa média-aguda isolada, a autora identificou um evento recorrente — um "gritinho" — e apontou os instantes: a cada 2 segundos, a partir de ~1,3 s. Foi feita uma tentativa de detectá-lo com os descritores do protótipo. **Quatro famílias de medida foram testadas e nenhuma o isolou:**

| medida testada | resultado |
|---|---|
| energia em 2.500–6.000 Hz | os instantes apontados caem em **vales** (−2 a +7 dB); os máximos estão 0,3 s depois |
| salto de brilho (centroide) sobre a base recente | dispara a cada **1,05 s** — o dobro da taxa: pega o evento da autora **e** um vizinho |
| destaque da nota mais forte em 1.200–3.000 Hz | mediana de 4,3 dB nos instantes apontados contra 5,8 dB nos intermediários: **não separa** |
| separação harmônica/percussiva (HPSS), seis variantes | melhor caso 56% de acerto disparando 25 vezes para 21 alvos: **não é detecção** |

**O que achou.** Casamento de molde espectral, usando como molde um trecho de 250 ms que a autora confirmou de ouvido: **21 ocorrências, intervalo mediano de 2,10 s**, coincidindo com as marcações dela (1,22 · 3,33 · 5,43 contra 1,3 · 3,3 · 5,3 apontados). A pequena defasagem crescente vem de a autora ter contado 2,0 s onde o intervalo real é 2,10 s.

**O que o evento é.** Uma nota em torno de **1.700 Hz** com componentes em 2.700 e 3.250 Hz. Contra o evento vizinho, a faixa de 1.500–2.000 Hz está 5,4 dB acima e as raias de 1.680 a 1.787 Hz de 12 a 14,5 dB acima. Mas um detector nessa faixa encontra um evento de mesmo período **deslocado 0,80 s** — acha o vizinho, não este. O que separa os dois é o **formato inteiro do espectro**, não um escalar.

**A conclusão, e o limite que ela impõe.** O evento que um ouvinte destaca de uma mistura polifônica **não é redutível aos descritores da tabela da seção 5**. Centroide, energia por faixa, fluxo espectral e separação harmônica descrevem propriedades médias; o que a escuta isola é uma configuração espectral inteira.

Isso confirma, com demonstração, o que a seção 5 já declarava de forma geral: *"tudo o que o protótipo faz com música contínua e polifônica é extensão propositiva"*. Agora há uma medida disso.

**Por que não foi resolvido com um molde marcado pela autora.** Seria possível: ela marca o som uma vez, o sistema guarda o formato espectral e compara cada leitura com ele — é o que o StrumSurfer faz com acordes. Foi **recusado** porque muda a natureza da afirmação. A cadeia do projeto é descritor acústico → dimensão perceptual → parâmetro visual, e cada seta pode ser contestada contra uma fonte. "A forma salta porque a autora marcou este som" não pode ser contestado contra nada: seria inquestionável, o que não é virtude.

A distinção que define a linha, e que vale para o resto do projeto: **calibrar escalas ao material é legítimo** (é o que a régua da angularidade, o piso de silêncio e a contagem de pontas já fazem); **definir o que conta como evento por marcação** não é, porque deixa de medir uma propriedade e passa a reproduzir uma escolha.

O protótipo continua com o detector de salto de brilho, que faz o que diz fazer — encontra picos de brilho — e cuja limitação está escrita aqui: ele dispara também num evento vizinho que a autora não percebe como o mesmo som.

### Composição na tela

As duas formas ocupam o mesmo palco, com centros distintos, e podem se sobrepor. A posição dos dois centros, a escala relativa e a ordem de desenho são decisões de composição da autora, não medidas do som. Por isso ficam no **arquivo de configuração**, não como controles na tela (seção 7): são escolhidas uma vez, no ajuste, e registradas.

**Decidida em 21/09/2026, escolhendo entre dez disposições vistas no mesmo instante.** Duas ficam disponíveis, alternáveis por um botão na tela:

| | centros | ordem de desenho |
|---|---|---|
| **Separadas** (padrão) | 0,38 e 0,62 da largura, ambas na meia-altura | indiferente |
| **Sobrepostas** | as duas em 0,50 · 0,50 | **grave à frente** |

Separadas ficam próximas o bastante para se lerem como um par e distantes o bastante para cada uma continuar legível. O botão é **comparação, não ajuste** — mesma classe de *silenciar uma forma* na regra da seção 7, e por isso fica na tela e não no arquivo.

**A profundidade é marcada pelo fundo, não por um cinza novo.** Na sobreposição, a forma de cima abre um vão de 14 px da cor do campo em volta de si antes de se preencher. As pontas da forma de baixo passam por trás dela e reaparecem do outro lado, e fica claro qual está à frente.

Isso resolve uma objeção real. As duas primeiras tentativas foram descartadas e ficam registradas: **com o mesmo cinza e centros coincidentes, sem vão**, a forma de baixo desaparece por inteiro e a ordem de desenho não muda um pixel; **distinguir as formas por valor** — uma mais clara que a outra — funcionaria, mas criaria um canal visual que não mede nada, rotulando as formas como legenda, e gastaria **justamente a luminosidade, que está reservada à valência** (seção 8 do PRD do v1). O vão evita as duas coisas: usa o fundo, que já existe, e não consome nenhum canal.

A largura do vão (`palco.vaoDeSobreposicao`) é decisão de composição e fica no arquivo de configuração.

**Escolhidas em 20/09/2026, ao ver as formas desenhadas:**

| valor | escolha | por quê |
|---|---|---|
| centros | **0,27 e 0,73** da largura | em 0,33 e 0,67, com as duas em energia cheia, elas se encostavam |
| extensão em x | **60 a 170 px** | com o teto anterior de 340 px a forma era sempre mais larga que alta e o eixo y praticamente não aparecia. O teto do eixo y é 162 px, que é o limite declarado na seção 5 e não sobe |
| piso da contagem de pontas | **5** | ver acima |

O eixo x menor tem um custo a declarar: quanto menor o alcance, menos a energia se lê na tela, e energia é V1 e V4. 170 px foi o ponto em que os dois eixos conseguem falar. Não é resultado perceptual.

---

## 7. Uma regra sobre controles

**Um controle só existe na tela se o som não puder determiná-lo.**

Esta regra é resposta a um problema do v1, levantado pela autora em 18/09/2026: o painel tinha controles deslizantes de angularidade, tamanho, altura na tela, brilho, descontinuidade e ataque. Mover um deles mostra uma forma que a pessoa mesma fez. Não diz nada sobre a música. Eles existiam porque a ordem de entrega do v1 mandava construir a forma antes do áudio, e sobreviveram à etapa que os justificava.

No v2 eles não entram. O que a leitura mede, a leitura decide.

### Os três tipos de valor, e onde cada um mora

| tipo | exemplo | onde fica |
|---|---|---|
| **medido do som** | extensão em x, distribuição em y, angularidade, força do acento | em lugar nenhum da interface. Sai da leitura e vai para a tela |
| **ajuste fino do sistema** | limites das faixas em Hz, constantes de suavização, limiar do detector, régua da angularidade, posição dos centros | **arquivo de configuração**, comentado em português. Muda, salva, recarrega |
| **escolha de quem está usando agora** | entrada, calibração, silenciar uma forma, volume de escuta, transporte | painel da tela |

A segunda linha continua valendo a exigência do v1: a autora precisa conseguir mudar qualquer valor de ajuste, salvar, recarregar e ver a diferença, sem editar a lógica. **Arquivo de configuração não é a mesma coisa que controle na tela.** O arquivo é onde se calibra o sistema uma vez; a tela é onde se assiste ao resultado.

### O que fica no arquivo de configuração

Entrada padrão, ganho de cada entrada, limites das duas faixas em Hz, frequência do passa-alta, tamanho da janela e do salto, constantes de suavização (140 e 180 ms) com **subida e descida separadas** (o StrumSurfer usa subir rápido e descer devagar; ponto de partida 18–22 por segundo na subida e 2,2–3,2 na descida), limiar adaptativo, fração mínima de faixas subindo juntas (15%) e período refratário (110 ms) do detector, piso de silêncio de cada faixa e limiar de confiança do brilho, subida e queda do acento (25 e 220 ms), janela da normalização móvel (3 s), extensão mínima e máxima em x de cada forma, **excursão máxima do eixo y (30% do campo)**, posição dos dois centros, escala relativa entre elas, limites em Hz da régua de angularidade, pontos de quebra e larguras de saída da expansão calibrada (ponto de partida 0,35 para cada forma), número de pontos de controle do contorno, valores da calibração, resolução do palco, cores do campo e das formas.

### O que fica na tela

- **Entrada**: microfone ou arquivo. Botão de calibrar.
- **Silenciar uma forma**: desliga a grave ou a média-aguda para ver a outra sozinha. É comparação, não ajuste: a forma que ficou não muda de comportamento.
- **Volume de escuta** e **transporte**, este só no modo arquivo.
- **Gravar**: no modo microfone, grava a tela em tempo real; no modo arquivo, salva o quadro do instante atual. Ver seção 3.
- **Painel de leitura** (abaixo).

Nada mais.

### Painel de leitura: os números no lugar dos controles

É isto que substitui os sliders. Uma lista discreta, atualizada em tempo real, mostrando o que a leitura está medindo e o que cada medida está causando:

| forma | medida | valor | confiança | causa na tela |
|---|---|---|---|---|
| grave | energia 30–220 Hz | −8 dB | — | extensão x: 62% |
| grave | brilho da faixa (centroide) | 74 Hz | alta | distribuição y: 12% · angularidade: 0,09 |
| grave | ataques | 1,4/s, último há 0,3 s | — | acento: 0,4 |
| médio-aguda | energia 350–6.000 Hz | −12 dB | — | extensão x: 38% |
| médio-aguda | brilho da faixa (centroide) | 1.509 Hz | alta | distribuição y: 55% · angularidade: 0,82 |
| médio-aguda | brilho da faixa (centroide) | *abaixo do piso* | **indisponível** | segurando 1.480 Hz |

Os números são de exemplo, e a última linha mostra como aparece uma medida sem confiança (seção 4). A medida chama-se **brilho**, não altura nem nota: escrever "centroide" ou "brilho" no painel, nunca "pitch". Ler a medida ao lado do que ela causa é o que permite dizer "esse trecho ficou apagado porque o brilho caiu", em vez de mexer num slider até ficar bonito. É também o que vai para o texto da monografia.

O painel pode ser recolhido para assistir sem números.

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

Muda o conteúdo do painel, conforme a regra da seção 7. **Saem todos os controles deslizantes de geometria** — angularidade, tamanho, altura na tela, brilho, descontinuidade, ataque — e com eles os seletores de estudo (estático / movimento / com áudio), o seletor de estrutura (fluxo / por entradas / separadas), leitura do timbre, força mínima da entrada, distância mínima no tempo, granulação, cor pela emoção, "Ver figura inteira" e "Comparar momentos". Entram: escolha da entrada, calibração, silenciar uma forma, e o painel de leitura.

A linha "padrões de controle" da tabela acima passa a valer para os poucos controles que restam. O que era um painel de ajustes vira um painel de leitura.

No modo microfone não há barra de tempo nem botão de recomeçar: não existe posição no tempo. O transporte é substituído por um indicador de entrada ativa e um botão de parar.

---

## 9. Ordem de entrega

A ordem do v1 construía a forma primeiro e o áudio depois, e foi o que produziu os controles manuais. **No v2 a leitura vem primeiro.** A forma nunca é movida pela mão.

**Etapa 1, concluída em 20/09/2026.** A pedido da autora, a primeira entrega deixou de ser "a leitura sem forma nenhuma" e passou a ser **o modo arquivo completo**: sobe-se uma faixa (botão ou arrastando), a página lê a faixa inteira numa passagem prévia para se calibrar, e desenha as duas formas. O microfone ficou para o fim.

A passagem prévia é possível **só no modo arquivo** — ao vivo não se conhece o futuro. Ela roda o **mesmo worklet** num contexto offline, mais rápido que o tempo real: não há um segundo analisador para manter em pé. Dela saem os limites de brilho de cada faixa, o piso de silêncio, os pontos de quebra da régua de angularidade e a contagem de pontas.

O que resta:

2. **Ajuste fino da forma com a autora**, assistindo em movimento e não em quadros congelados.
3. **Gerador de sinais de teste**, recolhido, como ferramenta de diagnóstico: com upload, testar com um tom puro é subir um arquivo de tom puro, mas um gerador embutido evita depender de arquivos externos.
4. **Modo microfone** com calibração tocando antes, pelo mesmo caminho de código.

Cada etapa é entregue e verificada antes da seguinte. Cada uma ganha um arquivo de conferência em `protótipo_v2/visual/`, no padrão dos `VERIFICACAO-*.md` do v1. A da etapa 1 está em `visual/VERIFICACAO-LEITURA.md`.

**Figuras.** O botão *Salvar este quadro* grava o instante atual em PNG 1920 × 1080 em `protótipo_v2/figuras/`, nomeado com o segundo. Como o modo arquivo é determinístico, o mesmo segundo dá sempre a mesma imagem. É a peça prevista na seção 3 para as figuras da monografia.

---

## 10. Aceite

A verificação é técnica, sem pessoas.

1. **As duas formas não andam juntas.** Gravar os valores das duas ao longo do trecho e calcular a correlação. Medição de referência de 18/09/2026 no áudio de teste: entre o ataque grave e o brilho médio-agudo, r = −0,08; entre a energia grave e o brilho médio-agudo, r = −0,53. Se na implementação as duas formas ficarem com correlação acima de 0,8, alguma coisa está ligada errado.
2. **O corte dos 22 s aparece.** No áudio de teste, a partir de 22 s a energia grave sobe cerca de 10 dB e o brilho cai de ~1.644 para ~1.286 Hz (medianas). A forma grave tem de ficar visivelmente mais extensa e a média-aguda tem de se recolher em direção ao centro do eixo y. Se nada mudar ali, a escala está achatada.
3. **Nenhuma forma pisca, treme ou salta.** Entre ataques, a forma grave volta ao repouso suavemente.
4. **O ataque chega antes do gesto.** O acento grave deve responder em torno de 60 ms e o gesto sustentado em torno de 200 ms. Conferir com um sinal de teste: um clique seco seguido de um tom sustentado.
5. **Modo arquivo é repetível.** Tocar o mesmo arquivo duas vezes tem de dar a mesma sequência de valores. Se não der, há dependência da velocidade da tela.
6. **Sinais de controle.** Um tom puro subindo de 100 Hz a 5.000 Hz tem de mover só uma forma de cada vez nas faixas certas, e nenhuma entre 220 e 350 Hz. Um ruído de banda larga move as duas.
7. **Silêncio não move nada.** Com a entrada muda, as duas formas ficam no mínimo, paradas, e o painel marca o brilho como indisponível. Qualquer movimento aqui é defeito.
8. **A trava de ataque falso funciona.** Um tom grave sustentado que ganhe um harmônico novo, sem ataque, não pode disparar acento. Conferir com sinal sintético.
9. **Nenhuma forma pisca ao entrar ou sair do silêncio.** Ao cruzar o piso, a forma segura o último brilho válido; não salta para o centro nem para as extremidades.
10. **As formas não trocam de lado na angularidade.** Ao longo do trecho inteiro, a angularidade da forma grave tem de ficar sempre abaixo da angularidade da forma média-aguda. Se cruzarem, a escala foi normalizada por faixa em vez de compartilhada, e o achado de F14 está invertido.
11. **Os picos de brilho aparecem.** Cada forma deve passar do **próprio teto** em alguns por cento dos quadros com som, não em nenhum e não na maioria. Se nunca passar, o transbordo está desligado ou a régua está larga demais; se passar o tempo todo, a calibração está estreita. Medido no áudio de teste em 22/09: a grave passa de 0,32 em **13,9%** dos quadros e a média-aguda passa de 0,78 em **16,6%**.
    *Redação corrigida em 22/09.* O critério dizia "a média-aguda deve passar de **1**", com 8% medidos. Isso só valia enquanto o transbordo somava um valor fixo: 1 é o fim da régua, e a forma de cima o alcançava por ser a de cima, não por ser um pico. Com o transbordo proporcional à folga (seção 5), a média-aguda passa de 1 em 0,6% dos quadros e o número antigo reprovaria uma implementação correta. O teto de cada forma é o que o transbordo de fato transborda.
12. **A angularidade anda o bastante para se ver.** Cada forma deve variar pelo menos **0,30** entre o percentil 5 e o 95 do trecho, e a folga entre as duas deve ficar acima de **0,12**. Conferir com o par de brilho de `pares-verificacao/`: entre 1.076 e 2.397 Hz a angularidade tem de andar em torno de 0,35. Se andar 0,20, a expansão calibrada não foi aplicada. Medido em 22/09: excursão de **0,310** na grave e **0,419** na média-aguda; folga entre as janelas de **0,13** e menor distância instantânea entre as duas de **0,121**.
    *Número corrigido em 22/09.* O critério pedia folga acima de 0,15 e **contradizia a própria configuração**: as janelas aprovadas no ajuste visual são 0,05–0,32 e 0,45–0,78, que deixam 0,13 de folga por construção. O critério reprovava o protótipo por não ser diferente do que foi aprovado. Baixado para 0,12, que é o que separa uma folga real de nenhuma. Se a intenção for mesmo 0,15, o que muda são as **janelas**, não o critério — e aí o ajuste visual precisa ser refeito.

Se houver falha, conferir captura, normalização, detecção, implementação gráfica e hipótese de mapeamento, nessa ordem. Não atribuir a falha a uma única camada automaticamente.

### A forma do v2 está fechada, 22/09/2026

A autora deu a forma por definida nesta data, para que o passo seguinte seja a cor. Cópia integral do código e deste documento no estado do fechamento em `protótipo_v2/historico/20260922-forma-v2-fechada/`.

**O que está congelado.** A geometria (corpo elíptico com relevo de espícula por cima), a régua absoluta compartilhada com expansão calibrada nos três eixos — angularidade, y e x —, a contagem de pontas derivada da calibração, o transbordo proporcional à folga, o acento dos graves, o comportamento no silêncio, as duas disposições e a assimetria medida em 0,70.

**Aceite medido no fechamento**, no áudio de teste, 855 quadros acima do piso:

| critério | pedido | medido | |
|---|---|---|---|
| 1. as duas formas não andam juntas | correlação abaixo de 0,8 | energia grave × brilho médio-agudo **−0,537**; angularidade × angularidade **0,178** | passa |
| 10. não trocam de lado | nenhum cruzamento | **0 cruzamentos**, menor distância **+0,121** | passa |
| 11. os picos aparecem | cada forma passa do próprio teto em alguns por cento | grave **13,9%**, média-aguda **16,6%** | passa |
| 12. a angularidade anda | excursão ≥ 0,30 por forma | grave **0,310**, média-aguda **0,419** | passa |

O critério 1 merece nota: **−0,537** contra **−0,53** medidos em Python em 18/09, num caminho de código inteiramente diferente. É a confirmação mais forte que esta etapa produziu de que a leitura da página mede o que a análise offline mediu.

Os critérios 2 a 9 dependem de sinais sintéticos ou de gravar som e tela juntos, e continuam por fazer — estão listados em `visual/VERIFICACAO-LEITURA.md`, em *O que esta etapa NÃO cobre*.

**O que a cor não pode mexer sem reabrir isto.** A luminosidade está reservada à valência desde o v1 e por isso não foi usada para marcar profundidade na sobreposição (seção 6); qualquer uso de claro e escuro pela cor tem de respeitar essa reserva ou desfazê-la explicitamente. E nenhum canal de cor pode carregar brilho, energia ou ataque: esses três já têm destino na forma, e duplicá-los faria a tela afirmar duas vezes a mesma medida com aparência de duas evidências.

---

## 11. Pendências que a autora precisa resolver

**P1. Angularidade. Decidida em 18/09/2026, fica registrada.** Parâmetro contínuo entre sem ponta e pontuda, lido do centroide numa escala absoluta compartilhada pelas duas formas. Círculo e triângulo não são declarados: são as duas pontas da escala, e a identidade de cada forma emerge da medida (seção 5). Restam dois números a escolher no ajuste visual, que são estéticos e não perceptuais: os limites em Hz da régua (ponto de partida 55 a 2.913 Hz, medidos neste material) e o número de pontos de controle do contorno (ponto de partida 9, herdado do v1). Registrar os valores escolhidos.

**P2. O eixo y, nos capítulos.** Duas coisas, não uma, e as duas precisam entrar no texto como decisão formal e não como aplicação de F16/F04/F08 (seção 5): que o descritor é **substituto** — brilho no lugar de altura de nota, porque a fundamental falhou em 99,9% dos quadros — e que a **simetria** não tem fonte. Decidir também se a assimetria de Eitan & Granot (F04) — descida puxa mais que subida — entra de alguma forma, ou se fica declarada como não adotada. A excursão menor do eixo y (30%) já está resolvida no PRD e é decisão de projeto, não pendência.

**P3. Composição dos dois centros. Decidida em 21/09/2026, fica registrada.** Duas disposições, alternáveis na tela: separadas (centros em 0,38 e 0,62) como padrão, e sobrepostas no mesmo centro com a forma grave à frente, marcada por um vão da cor do fundo. Detalhe na seção 6, em *Composição na tela*.

**P4. O registro. Decidida em 18/09/2026, fica registrada.** Sem modo de acúmulo: gravação de tela para a performance, captura de quadro no modo arquivo para as figuras da monografia, e o registro do percurso segue sendo contribuição do v1. Detalhe na seção 3. O que resta é escolher **quais instantes** viram figura do capítulo — os 22 s são um deles por medida, os outros são escolha de leitura da autora.

**P4b. O silêncio. Decidida em 18/09/2026, fica registrada.** As formas recolhem ao mínimo e ficam paradas; nada de animação de repouso, porque movimento sem causa sonora contradiz a seção 2. Detalhe na seção 6.

**P8. O evento não capturado.** Decidido em 21/09 não resolver com molde marcado (seção 6). O que resta é de escrita: o achado precisa entrar no capítulo como limite demonstrado, com as quatro medidas que falharam e a que funcionou fora do enquadramento. Os arquivos de escuta que levaram à confirmação estão em `insumos/onde-esta-o-gritinho/`.

**P7. A simetria das formas. Decidida em 22/09/2026, fica registrada.** Vale **assimetria medida**, com força 0,70. Cada terço do contorno é modulado por uma sub-região da própria faixa, de modo que a assimetria passa a significar a desigualdade interna do som naquele instante: quando a energia do grave se concentra no terço superior da sua banda, a forma fica torta para esse lado, e a torção **gira** conforme a energia se desloca. A simetria continua disponível como botão na tela, junto com a variante decorativa, porque as três desenham a mesma leitura de maneiras diferentes — é comparação, não ajuste (seção 7).

O limite que o texto precisa defender continua valendo, e é o que separa esta decisão de um mostrador: **três números por forma é medida; o espectro inteiro em coordenadas polares é display**, e a seção 2 exclui display. A escolha de três sub-regiões não é arbitrária no sentido de poder crescer: ela é o teto, não um ponto de partida.

Duas coisas tiveram de ser corrigidas antes de a comparação valer alguma coisa, e ficam registradas porque as primeiras rodadas de comparação foram **inválidas** e quase levaram à decisão errada:

- a configuração não chegava ao contorno (`cfg.assimetria` lido do objeto errado), e os três modos desenhavam exatamente a mesma forma;
- o desvio era indexado por **ponta** (`k % 3`), o que com 6 pontas e 3 sub-regiões impunha uma simetria nova de três dobras em vez de quebrar a existente — e o corpo continuava uma elipse perfeita, porque o desvio só tocava o relevo.

Resolvido fazendo o desvio ser função da **fase contínua** ao longo do perímetro e deixando-o entrar também no **raio do corpo** (`assimetria.noCorpo`). As três proporções precisaram ainda de suavização própria: saíam cruas do worklet, as únicas grandezas do caminho sem filtro, e a torção piscava em vez de girar (`suavizacao.subRegioes = 170 ms`; números em `visual/VERIFICACAO-LEITURA.md`).

**P5. Onde o ao vivo entra.** Parcialmente decidida em 22/09/2026. **O modo microfone não será construído agora** — o código existe, nunca foi exercitado, e fica como demonstração e não como entrega. O que continua aberto é a pergunta de escopo, que é da autora e não do protótipo: se o ao vivo aparece no TCC 1, no TCC 2 ou como trabalho futuro. A resposta muda quanto do microfone precisa estar pronto, e só ela reabre o assunto.

**P6. Cor.** Fora do v2 por decisão de escopo. Se voltar, volta com a especificação inteira do v1 (seção 8 do PRD anterior), inclusive a restrição de luminosidade compartilhada por valência. Não reabrir pela metade.

Da bibliografia e dos capítulos, continuam abertas as pendências do PRD anterior, que não mudam com o v2: referências citadas via outro autor, a correção sobre os estímulos de Zacharakis, a data de Passi & Arun, os anais de Liew et al., a paginação de Hamilton-Fletcher et al., e a entrada de Erdmann et al. e Lembke na bibliografia categorizada.

---
## 12. Anexo: o que cada fonte diz

Anexo preservado do PRD anterior, sem alteração. **As linhas "No PRD:" de cada ficha usam a numeração de seções do v1**, não a deste documento; a correspondência com o v2 está na tabela da seção 5. As fichas cujo assunto é cor e emoção descrevem material que ficou fora do escopo do v2 (seção 1) e continuam aqui porque voltam a valer se a cor voltar (pendência P6).

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
