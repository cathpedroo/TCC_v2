# PRD: A forma do som

Protótipo de visualizador de som instrumental baseado em correspondências crossmodais.
Documento de especificação para desenvolvimento assistido.

Versão 3.1, 14 de setembro de 2026. Revisão de emoção e cor: apoio científico qualificado, escala emocional fixa, luminosidade independente da excitação e identificação das amostras. A versão imediatamente anterior está em `protótipo_v1/historico/20260914-170620_ajuste-prd-emocao-cor/PRD-antes.md`.

Correções da análise autorizadas pela autora; a versão anterior a essas correções e os resultados anteriores estão em `protótipo_v1/historico/20260914-105631_antes-correcao/`. Tabelas conferidas contra os PDFs de ARTIGOS; o que cada
fonte diz, com página, está no anexo (seção 12). A referência à versão 1 no documento anterior não corresponde a um arquivo encontrado nesta pasta.

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

## 1. O que é este projeto

Um sistema que analisa uma gravação de música instrumental e desenha uma sequência de formas abstratas, onde cada característica visual corresponde a uma característica sonora. Parte dessas ligações tem apoio em achados publicados de psicologia da percepção e acústica; parte é decisão de projeto. A tabela da seção 6 diz qual é qual.

O resultado registra a sequência do som. No experimento atual, uma forma contínua cresce para a direita sem parar entre entradas, preservando os trechos já desenhados. Sua altura se expande simetricamente acima e abaixo do eixo central. Componentes sustentados dos médios/agudos produzem um gesto suave; ataques graves acrescentam deformações rápidas à mesma forma. O percurso anterior, com formas separadas que nascem à direita e caminham para a esquerda, permanece disponível para comparação.

O que diferencia este projeto de um visualizador comum é a camada intermediária. Não existe ligação direta entre espectro e pixel. Existe: descritor acústico, dimensão perceptual, parâmetro visual, e cada seta tem fonte e tipo de correspondência declarados. Onde não há fonte, a seta é marcada como propositiva.

Este protótipo ainda não aplica os pesos de Zacharakis et al. (2015) para posicionar o som nos três eixos perceptuais do timbre (etapa 2 do método). A coluna "eixo" da tabela indica onde cada descritor carrega naquele estudo, para que a versão seguinte encaixe sem reescrever a tabela.

## 2. O que este projeto não é

- Não é um visualizador reativo em tempo real. A análise é feita antes, offline.
- Não é um espectro em barras nem uma forma de onda.
- Não pisca no ritmo. Não tem partículas explodindo na batida.
- Não usa nenhum efeito visual que não esteja na tabela da seção 6.
- Não separa instrumentos. A mistura é tratada como um timbre só.
- Não testa nada com pessoas. A verificação é técnica, contra resultados já publicados.

Se em algum momento uma escolha visual não puder ser explicada pela tabela, ela está fora do escopo.

---

## 3. Arquitetura em duas etapas

A separação entre as duas etapas é obrigatória. Não junte.

### Etapa A: análise

Um script em Python lê o arquivo de áudio, extrai os descritores quadro a quadro e grava tudo num arquivo JSON. Roda uma vez e pronto.

Produz também gráficos em PNG de cada descritor ao longo do tempo, para inspeção visual e para uso no corpo da monografia.

A etapa A também gera os estímulos de verificação de Fort & Schwartz (2022) e roda a análise sobre eles (seção 7, aceite).

### Etapa B: desenho

Uma página web lê o JSON, toca o áudio, e desenha as formas sincronizadas com o tempo de reprodução. Canvas 2D, sem framework, sem servidor. Abre com dois cliques.

### Por que separado

Porque os números precisam existir como artefato citável e inspecionável. Se o mapeamento vive dentro do código de desenho, cada ajuste visual apaga o registro do que foi testado. A cópia versionada do JSON no histórico, acompanhada de código, configuração e manifesto, é o que vai para o anexo do TCC, e é o que alimenta uma eventual versão em TouchDesigner na segunda entrega.

---

## 4. Estrutura de pastas

```
projeto/
├── audio-prototipo/          fornecida, contém o arquivo de áudio (.wav ou .mp3)
├── referencias-visuais/      fornecida, imagens de direção estética
├── analise/
│   ├── analisar.py
│   ├── gerar_estimulos_fort.py
│   ├── config-analise.py
│   ├── emocao.csv            opcional, ver seção 7
│   └── saida/
│       ├── dados.json
│       ├── graficos/
│       └── verificacao/
└── visual/
    ├── index.html
    ├── desenho.js
    └── config-visual.js
```

Na pasta ARTIGOS, os arquivos de origem estão em `áudio protótipo.mp3` e `referências visuais/`, com acento e espaço. Copie para as pastas acima, sem acento, antes de começar.

Antes de escrever qualquer código, abra as imagens em `referencias-visuais/` e descreva em voz alta o que você observou: se as formas são preenchidas ou de contorno, a paleta, o peso da linha, o fundo. Leitura confirmada pela autora: formas preenchidas, sem contorno; fundo escuro para destacar as cores. Até a emoção, preenchimento cinza neutro.

---

## 5. Fonte sonora

O arquivo de áudio que estiver em `audio-prototipo/`. Um trecho recortado de 30 a 60 segundos.

O arquivo atual é `áudio protótipo.mp3`: 39,3 s, estéreo, 44,1 kHz, MP3 a 320 kbps. O script aceita .wav ou .mp3 e converte para mono pela média dos canais. A compressão MP3 mexe nos agudos e afeta mais planura e aspereza do que centroide e RMS; se existir versão em WAV da mesma gravação, use a WAV. Converter o MP3 para WAV não recupera nada.

O sistema não assume nada sobre instrumentação, gênero ou densidade da gravação. As faixas numéricas deste documento são pontos de partida e precisam ser recalibradas para o material real, conforme o procedimento abaixo.

### Caracterização, primeira tarefa do projeto

Antes de definir qualquer faixa numérica, rode a análise da etapa A e produza um relatório curto sobre o arquivo, respondendo:

- em quantos por cento dos quadros a frequência fundamental foi detectada com confiança
- qual a faixa real do centroide espectral, em Hz, entre o percentil 5 e o 95
- quantos ataques por segundo, em média
- qual a faixa da planura espectral
- qual a faixa da aspereza
- a gravação é limpa e esparsa, ou densa e sobreposta

As respostas determinam quatro decisões:

| se | então | por quê |
|---|---|---|
| a fundamental falha em boa parte dos quadros | a posição vertical passa a vir do centroide, para o trecho inteiro, e isso é declarado | o que tem apoio é altura → posição (F16, F04, F08); centroide é substituto |
| a planura fica presa numa faixa estreita | esse descritor sai do protótipo | é o descritor com menos apoio perceptual (F19) |
| a aspereza fica presa numa faixa estreita | compressão forte ou saída do protótipo | com notas reais de instrumento, a aspereza calculada variou pouco e não teve efeito (F10, estudo 1) |
| os ataques passam de cinco por segundo | o limiar e o espaçamento mínimo entre formas precisam subir, senão a tela satura | decisão de projeto |

### Trecho de demonstração

Escolha dentro do arquivo dois momentos de timbre claramente contrastante, um som escuro e de ataque lento contra um som brilhante e de ataque seco. Anote os tempos dos dois em segundos.

As janelas em 1,0–1,5 s e 17,0–17,5 s foram aceitas com ressalva pela autora como referências exploratórias. Contêm mistura; não são sons isolados nem prova de ataque lento ou seco. A diferença numérica do centroide é um diagnóstico, não um árbitro da escuta. Não substituir janelas sucessivamente para obter aprovação: a verificação técnica usa sinais de controle conhecidos; a escolha da demonstração é separada.

---

## 6. Tabela de mapeamento

Esta tabela é o coração do projeto. Cada linha deve aparecer como comentário no código, ao lado da função que a implementa, com o código da ficha (F01, F02...) e a referência curta.

Colunas:
- eixo: onde o descritor carrega em Zacharakis et al. (2015). EDHP é a distribuição de energia entre parciais, que se correlaciona com os três eixos; T/STV é a variação temporal, que prediz o 2º eixo; STV é a variação espectrotemporal, que não prediz nenhum (F19).
- tipo: classificação de Spence (2011, Tabela 2, p. 987): estrutural, estatística ou semanticamente mediada.
- regime: verificável quando há resposta publicada para conferir; propositivo quando é decisão de projeto declarada.

| # | descritor de áudio | eixo | parâmetro visual | direção | fontes | tipo | regime |
|---|---|---|---|---|---|---|---|
| 1 | centroide espectral (log2), ou centroide dos aumentos espectrais (ênfase nas entradas) | EDHP | angularidade do contorno | mais agudo, mais pontudo | F14 Passi & Arun 2022; F06 Fort & Schwartz 2022; Marks 1987a via F16 Spence 2011 | estatística | apoio em sons isolados; extensão e ênfase nas entradas propositivas |
| 2 | descontinuidade do envelope e log-attack-time | T/STV (2º eixo) | contribuição de angularidade no nascimento | mais descontínuo e mais seco, mais pontudo | F06 Fort & Schwartz 2022; F12 McAdams et al. 1995; F19 Zacharakis et al. 2015; F15 Peeters et al. 2011 | estatística | adaptação propositiva; continuidade original e teste do protótipo não são equivalentes |
| 3 | F0 com confiança, em ERB-rate (substituto: centroide) | F0 prediz textura | posição vertical | mais agudo, mais alto | F16 Spence 2011; F04 Eitan & Granot 2006; F08 Küssner & Leech-Wilkinson 2014; F09 Lembke 2023 | estatística e semântica | verificável na nota isolada, propositivo no fluxo |
| 4 | RMS (amplitude linear) | fora dos eixos | raio da forma | mais forte, maior | Smith & Sera 1992 via F16; Lipscomb & Kim 2004 via F05 e F11; precedente em F05 Erdmann et al. 2025 | estatística | apoio indireto |
| 5 | aspereza (Sethares) | conflito: ver nota | perturbação de alta frequência na borda | mais áspero, borda mais irregular | F10 Liew et al. 2017; F18 Winter 2025; precedente em F05 | não classificada | propositivo |
| 6 | valência e excitação | fora dos eixos | matiz, luminosidade e croma | ver seção 8, Cor | F11 Lindborg & Friberg 2015; F20 Palmer et al. 2013; F21 Whiteford et al. 2018; precedente em F05 Erdmann et al. 2025 | mediada por emoção (F20); em Spence, a mais próxima é a semanticamente mediada | direções com apoio em estudos com música; tons exatos propositivos |
| 7 | planura espectral (opcional) | STV, que não prediz eixo | granulação da borda | mais ruidoso, mais granulado | sem âncora direta na pasta | não se aplica | propositivo |
| 8 | onset acima do limiar | fora dos eixos | nascimento de uma nova forma | acima do limiar, nasce forma | decisão de projeto; tensão com F08; apoio parcial em F02, F05 e F17 | não se aplica | propositivo |

Ordem de implementação: centroide, RMS e onset primeiro. Depois descontinuidade e ataque, depois F0. Aspereza em seguida, porque não vem pronta na biblioteca e precisa ser escrita à mão. Cor por emoção e planura por último.

### Notas por linha

Linha 1. Passi & Arun calculam a "frequência média" como a média do espectro de potência normalizado, que é a definição do centroide espectral, e ela prevê a escolha da forma pontuda com r = .88 em tons puros e r = .89 em sons de objetos reais. A frequência do pico espectral não prevê (F14). Fort & Schwartz dão o mecanismo físico (F06). Adeli et al. (2014) não entram nesta linha: testaram timbre com envelope normalizado, não centroide (F01).

Linha 2. A combinação se inspira nas propriedades espectrais e temporais de Fort & Schwartz, mas não reproduz o modelo. O original usa balance de um banco gammatone, log(mín/máx) da energia e regressões; aqui são usados centroide e 1 − mín/máx do envelope Hilbert filtrado. Os pesos 0,5/0,5 são decisões de projeto. A falha do critério estrito fica registrada, sem concluir que a continuidade perdeu apoio científico.

Dois modos reversíveis, decisão da autora: `CENTROIDE_NO_NASCIMENTO = "chegada"` significa **ênfase nas entradas**, e `"tudo"` significa **mistura completa**. A primeira opção mede aumentos positivos de energia espectral; não separa instrumentos ou sons simultâneos. Crescimento de um som já existente também conta. Entradas fracas podem ficar abaixo do limiar de 5%; nesse caso, o centroide da mistura atual é usado como substituto, explicitamente marcado. A troca vale para angularidade e posição vertical substituta. RMS, aspereza e descontinuidade continuam descrevendo a mistura. O sistema não promete uma forma grave e outra aguda para cada par simultâneo.

Linha 3. Cap. 4.3: a F0 entra como posição vertical e fica fora do contorno. Pitch–elevação é uma das correspondências mais robustas (F16, p. 976). A relação vale sobretudo para descidas e fraca para subidas (F04); ver pendência sobre a assimetria. Com timbres musicais, Adeli et al. não encontraram associação entre F0 e altura na tela (F01), o que lembra que o efeito é medido com tons e com contraste.

Linha 4. Stevens (1957) saiu desta linha: Spence o cita para loudness–brilho (estrutural), não para tamanho (F16, p. 988). Alternativa com mais apoio para trajetória: loudness → espessura de linha (F08). Tensão declarada: tom grave puxa objeto grande (F13; F16, Tabela 1). O tamanho aqui ignora a altura; Erdmann et al. registram que altura se associa mais a posição do que a tamanho (F05, p. 2).

Linha 5. Plomp & Levelt (1965) e Sethares (1993) são a origem do descritor, não da correspondência. Conflito a declarar no texto: em Liew et al. a aspereza puxa forma pontuda (F10); em Zacharakis et al., inarmonicidade e razão ímpares/pares carregam no detalhe espectral, que prediz luminância e não textura (F19). O protótipo segue Liew, e isso é decisão.

Linha 6. Decisão já tomada: a cor não sai do sinal. Em Lindborg & Friberg, os parâmetros de cor não se correlacionaram significativamente com nenhum descritor de áudio, e os modelos com emoção explicaram de 60 a 75% da variação (F11). Whiteford et al. chegaram ao mesmo ponto com 34 gêneros: as ligações diretas entre características da música e cor deixaram de ser significativas quando a emoção foi controlada, e a emoção explicou mais variação da cor do que as características musicais (F21, p. 14 e 18). Palmer et al. tratam essa ligação como uma classe própria, mediada por emoção, que Spence só mencionava como possibilidade (F20, p. 8840). Frequência → croma e loudness → croma (F07) valem para tons e sons de banda estreita e não são usados; ficam registrados como evidência convergente.

Linha 7. A planura é do catálogo do Peeters (F15), mas isso ancora o número, não a granulação. No Zacharakis, noisiness e flux (componente STV) não se correlacionam com nenhum eixo perceptual (F19, Tabela 8). Fica desligada por padrão.

Linha 8. Quando o som dura, pessoas desenham trajetória, não formas separadas (F08). Nascer uma forma por onset é resposta de projeto à distância "forma contra trajetória" do cap. 2.7.

### Sobre a honestidade da tabela

Três ressalvas que devem constar como comentário no código e no texto da monografia.

A correspondência entre altura e posição vertical é a mais replicada das que o protótipo usa (F16). A ligação entre frequência e forma pontuda tem apoio direto com o próprio centroide (F14) e mecanismo físico (F06), mas foi medida em sons curtos e isolados.

Nenhuma cor sai do sinal. A cor vem de emoção. Palmer et al. defendem uma classe própria de correspondência, mediada por emoção (F20, p. 8840); na classificação de Spence, a mais próxima é a semanticamente mediada, aprendida e possivelmente dependente de cultura. Os quatro cantos de cor (seção 8) têm direções informadas por estudos com música (F11, F20, F21); a combinação das regras e o tom exato de cada canto são decisões de projeto, com apoio parcial e diferenças entre os estudos. Palmer estudou participantes nos Estados Unidos e no México (F20), Whiteford nos Estados Unidos (F21), e Lindborg & Friberg em Singapura (F11). O Brasil não foi testado nesses estudos. Isso deve ser declarado, não escondido. Uma banca vai perguntar.

Tudo o que o protótipo faz com música contínua e polifônica é extensão propositiva. As fontes não validam a combinação específica de descritores e eventos aplicada aqui à mistura. Existem estudos da pasta com música; isso não constitui validação de separação de fontes por este algoritmo.

---

## 7. Etapa A: especificação da análise

### Entrada

Arquivo `.wav` ou `.mp3` em `audio-prototipo/`. O script deve encontrar o arquivo sozinho, sem caminho digitado à mão. A versão instalada das bibliotecas está registrada em requirements.txt e no manifesto de execução.

### Janela de análise

Janela de 4096 amostras, avanço de 512, zero padding fator 2 (n_fft = 8192). A 44,1 kHz, isso dá um quadro a cada 11,6 ms (86 quadros por segundo) e uma janela de 93 ms.

Motivo: são as condições de Zacharakis et al. (2015): janela de 4096 amostras a 44,1 kHz, sobreposição de 87,5% e zero padding fator 2 (F19, p. 402). Com isso, a extração fica pronta para aplicar os pesos na versão seguinte.

### Descritores, por quadro

- centroide espectral, convertido para escala log2
- F0 por pYIN, com a probabilidade de vozeamento de cada quadro, convertida para ERB-rate: E(f) = 21,4 · log10(4,37 · f / 1000 + 1) (Glasberg & Moore, 1990, fórmula como em F09, p. 2770)
- RMS, em amplitude linear, não em dB (F09)
- envelope de energia: amplitude do sinal analítico (transformada de Hilbert) filtrada por passa-baixa Butterworth de 3ª ordem a 5 Hz, como no Timbre Toolbox (F15, p. 2904)
- descontinuidade: 1 menos a razão entre o mínimo e o máximo do envelope numa janela deslizante (padrão 500 ms, configurável)
- força de onset e lista de onsets detectados, com tempo e força
- log-attack-time de cada onset: log10(fim do ataque − início do ataque) (F15, p. 2907)
- aspereza pela função de Sethares, calculada sobre os 12 picos espectrais mais fortes de cada quadro
- planura espectral (gravada sempre, mapeada só se ligada)
- largura de banda espectral (gravada, não mapeada; fica para os pesos do Zacharakis)

Sobre a descontinuidade: Fort & Schwartz calculam log(mínimo/máximo) da energia somada nos canais do banco gammatone (F06, p. 9). A medida do protótipo usa outra representação, outro filtro e outra transformação. Nem em um estímulo de 500 ms ela reproduz o índice original. A janela deslizante centrada inclui contexto anterior e posterior.

Sobre o log-attack-time: o Timbre Toolbox estima início e fim do ataque pelo método "weakest effort", porque limiar fixo (por exemplo, início em 10% do máximo e fim no máximo) não é robusto em sons reais (F15, p. 2906). A adaptação ao fluxo estima o ataque numa região delimitada pelos onsets vizinhos. Subidas sem alinhamento com o onset (tolerância configurável de 50 ms) ficam indisponíveis. Ausência de medida é gravada como null e não é classificada como ataque lento. A medição não identifica uma fonte isolada.

### Emoção

Valência e excitação, numa escala de 1 a 9, com um valor por segundo, interpoladas para os quadros.

Caminho principal, confirmado pela autora em 14/09/2026: o modelo de emoção do Essentia (`emomusic-msd-musicnn`), o mesmo usado por Erdmann et al. (2025). O artigo relata R² = .646 para excitação e .515 para valência e aproximadamente uma estimativa por segundo (F05, p. 5); esses números não são resultados medidos neste protótipo. Erdmann et al. usaram o modelo para escolher cores, e o público avaliou a congruência de cor como maior que numa versão com cores sorteadas (F05, p. 11). Valência e excitação também são as dimensões afetivas interpretadas por Whiteford et al. (F21, p. 15-17). Essa compatibilidade conceitual fundamenta a escolha do modelo, mas não demonstra equivalência entre suas estimativas e as avaliações dos ouvintes. Antes de instalar, avise: exige o pacote do Essentia com TensorFlow, que pode não ter versão pronta para este Mac.

Conferência possível no TCC 2: perguntar a ouvintes se as cores combinam com a música e com o clima dela, com os dois itens de congruência de cor de Erdmann et al. (F05, p. 10).

Caminho de reserva, só se a instalação falhar: a autora anota `analise/emocao.csv`, com colunas `inicio_s, fim_s, valencia, excitacao`. Isso é julgamento da autora, não de participantes, e é declarado no texto.

O detector de onsets usa representação própria (2048 amostras, 128 bandas mel); seus parâmetros estão explícitos na configuração. As 4096 amostras com zero padding se aplicam ao espectro dos descritores. Um onset é candidato, não uma nota reconhecida.

### Normalização

Para os descritores acústicos, use os percentis 5 e 95 do trecho inteiro, com corte nos extremos. Não use mínimo e máximo: um pico isolado destrói a escala. Esta regra não se aplica à valência nem à excitação.

```python
lo, hi = np.percentile(x, 5), np.percentile(x, 95)
x_norm = np.clip((x - lo) / (hi - lo), 0, 1)
```

Calcule os percentis sobre as medidas locais válidas, antes de preencher lacunas ou suavizar. Grave `lo`, `hi`, valores brutos, máscara de validade, valores locais normalizados e curvas suavizadas no JSON. Eventos usam os valores locais; curvas suavizadas servem à inspeção. Os dois modos têm escalas relativas próprias, registradas e calculadas pelo mesmo procedimento. Esses valores são necessários para reproduzir a análise em outro ambiente e devem ser reportados na metodologia.

Motivo da normalização relativa: as correspondências observadas em laboratório são majoritariamente relativas, não absolutas (F16, p. 977). Regra 3 do cap. 5.3.

**Exceção da emoção:** preserve a escala fixa de 1 a 9, tanto para o modelo quanto para a anotação da autora. Para a interpolação das cores, converta cada dimensão por `x_norm = (x − 1) / 8`, limitada ao intervalo de 0 a 1. Assim, 1 corresponde a 0, 5 a 0,5 e 9 a 1; não recalibre esses limites por música ou janela. Por exemplo, valores de 4,8 a 5,2 continuam próximos do centro (0,475 a 0,525), em vez de ocupar os extremos da paleta.

Essa conversão fixa é uma decisão de projeto para preservar a interpretação da escala, não uma afirmação de universalidade da emoção. A faixa de 1 a 9 é a declarada na [documentação do modelo emoMusic do Essentia](https://essentia.upf.edu/models.html#arousal-valence-emomusic). Grave no JSON os valores originais, a origem da emoção, os limites fixos e os valores convertidos. Valores fora da faixa devem ser sinalizados e preservados no registro; o corte vale apenas para o desenho. Ausência de estimativa permanece indisponível, sem ser convertida em emoção neutra; nesse caso, a forma usa cinza neutro como indicação de ausência de cor emocional.

Escalas dos descritores acústicos antes de normalizar:
- centroide em log2: uma oitava vale a mesma distância em qualquer região do espectro
- F0 em ERB-rate: é a escala em que um gesto de altura é percebido como linha reta (F09)
- RMS em amplitude linear: é a escala em que um gesto de loudness é percebido como linha reta; em dB, a linha parece curva (F09)

O mapeamento é monotônico: definida a direção, ela não inverte no meio da escala (regra 4 do cap. 5.3).

### Suavização

Cada descritor tem uma constante de tempo diferente. Todas são decisões de projeto, ajustáveis, sem fonte.

| parâmetro | constante | motivo |
|---|---|---|
| cauda de ataque, só diagnóstico | 0 ms subindo, 150 ms descendo | não alimenta as formas |
| RMS | 30 ms | acompanhar dinâmica sem tremer |
| centroide | 80 ms | abaixo disso vira tremor |
| F0 | 80 ms | igual ao centroide |
| aspereza | 200 ms | é uma sensação lenta |
| planura | 120 ms | |
| emoção | 1 s | a estimativa já vem a cada segundo |

A curva de diagnóstico do ataque é assimétrica. No desenho, cada evento usa apenas seu próprio ataque medido e congela esse valor; não usa a cauda de eventos anteriores.

A suavização causal atrasa as curvas de inspeção. O adiantamento aproximado antigo fica desligado por padrão: pode antecipar mudanças e não garante sincronia. Eventos preservam seu instante de detecção e usam descritores locais, sem esse filtro. A janela centrada ainda mistura aproximadamente 93 ms de contexto. A tolerância de 25 a 50 ms é referência de avaliação para estímulos curtos (via F05), não garantia do algoritmo. Sincronia audiovisual será medida na etapa 4.

### Saída

Um `dados.json` contendo: taxa de quadros, duração, os arrays normalizados de cada descritor, a probabilidade de vozeamento, a lista de onsets com log-attack-time, a emoção e sua origem (modelo ou anotação), os valores de `lo` e `hi` de cada descritor, e os parâmetros de análise usados.

Um PNG por descritor em `analise/saida/graficos/`, com eixo em segundos. O JSON versão 2 também guarda `eventos`, com seleção comum aos dois modos, valores locais, validade do ataque e angularidade de cada modo. Calcular tempo como `quadro × avanco_amostras / taxa_amostragem`; não arredondar o intervalo entre quadros. A duração vem do número de amostras do áudio.

Cada execução conserva uma cópia em `protótipo_v1/historico/`, com código, configuração, resultados, versões e hashes das entradas. A pasta `saida/` contém a versão corrente; a referência citável é uma execução identificada. Trechos candidatos antigos não são apagados e têm índice por execução.

### Conferência da etapa A

1. Testes de cálculo: tons de frequência conhecida, mistura com entrada controlada, limiar de entrada, ataque indisponível, ausência de herança entre eventos, fórmula limitada, seleção por força e intervalo, relógio e exportação. Esses testes verificam funcionamento, não percepção humana.
2. Janelas escolhidas: registrar centroide e angularidade completa dos eventos, incluindo medidas indisponíveis. O antigo limite de diferença 0,20 continua como indicador exploratório, sem rótulo de validação perceptual.
3. Teste sintético **inspirado** no Noise Band Experiment de Fort: 8 frequências (300, 500, 600, 700, 800, 900, 1000, 1200 Hz), largura de banda de um décimo da frequência central, 500 ms a 44,1 kHz e vale entre 225 e 275 ms em 0, 0,1, 0,5 ou 1. O protocolo principal mantém o mesmo ruído filtrado para os quatro vales de cada frequência. A versão anterior, com ruídos independentes, permanece como comparação. São registrados os dois modos de centroide e 20 sementes adicionais de ruído, sem selecionar apenas casos favoráveis.
4. O critério estrito do protótipo permanece: centroide crescente com frequência, descontinuidade crescente com profundidade do vale e angularidade de base sem inversões. A exigência não é atribuída ao artigo. As falhas são registradas separadamente das tendências médias. A grade usa a contribuição de base, sem ataque, e não substitui os testes da fórmula completa.

O modelo original de Fort não foi replicado. Diferenças: filtro de geração, representação espectral, transformação da continuidade e pesos. O artigo disponibiliza suplemento e endereço de dados/scripts; uma reprodução exigiria conferir essa implementação de referência. A condição propositiva da adaptação não transforma uma falha técnica em aprovação. A avaliação visual permanece pendente da etapa B.

---

## 8. Etapa B: especificação do desenho

### Comportamento temporal

**Experimento atual — fluxo simétrico (16/09/2026).** O avanço horizontal é contínuo, a 190 px/s por padrão, vinculado ao tempo do áudio. Não há passos nem espera pelo próximo onset. Sons sustentados ocupam um trecho horizontal mais longo porque duram mais. Pausar congela o instante; buscar recompõe exatamente o histórico.

Uma única função de semialtura `h(t)` define as bordas `y = centro − h(t)` e `y = centro + h(t)`. O centro não sobe nem desce. Frequência/brilho influenciam a expansão dos dois lados, substituindo neste experimento o mapeamento anterior de posição vertical. Essa simetria foi solicitada pela autora como escolha formal; não constitui validação da correspondência perceptual anterior de “agudo em cima”.

A leitura suave usa a energia e o centroide logarítmico da parcela harmônica entre 350 e 6.000 Hz. A leitura marcada usa fluxo espectral positivo entre 30 e 220 Hz, com detecção independente de ataques. Cada acento tem subida de 25 ms e duração total de 220 ms; soma altura à curva suave sem alterar o avanço horizontal. Nenhuma batida reposiciona o centro. Os controles **Gesto dos agudos** e **Impacto dos graves** ajustam separadamente essas contribuições, incluindo zero para comparação. O volume/mudo afeta apenas a escuta.

Os dados complementares ficam em `analise/saida/faixas.json`; o áudio e `dados.json` anteriores permanecem intactos. A análise usa STFT de 4096 amostras a 44,1 kHz, avanço de 512, separação harmônica/percussiva por medianas (HPSS, kernel 31/31, margens 2/1), energia normalizada pelo percentil 95 de cada faixa, piso de −45 dB em relação à mistura e suavização causal de 140 ms para energia aguda e 180 ms para brilho. O centroide é escalado logaritmicamente nos limites fixos da faixa; não é F0 nem transcrição de notas. A separação favorece componentes sustentados, mas não isola uma melodia ou instrumento. A janela centrada e as medianas usam contexto futuro; a suavização atrasa o gesto suave. A latência perceptual precisa ser avaliada. Fontes de implementação: [HPSS no librosa 0.11](https://librosa.org/doc/0.11.0/generated/librosa.decompose.hpss.html) e [detecção de onsets](https://librosa.org/doc/0.11.0/generated/librosa.onset.onset_detect.html).

O corpo é amostrado a 160 posições por segundo, incluindo início, pico e final de cada acento. O histórico não muda após ser desenhado. A câmera acompanha a ponta quando a extensão ultrapassa o palco; **Ver figura inteira** comprime somente o eixo horizontal para mostrar o histórico sem reduzir a altura. Aspereza e granulação opcionais acrescentam pequenas irregularidades espelhadas. A fórmula de angularidade e a geometria polar abaixo pertencem aos estudos anteriores; este fluxo utiliza outra construção, por semialtura ao longo do tempo. Emoção e cor permanecem adiadas.

O palco tem resolução lógica e exportação de **1920 × 1080**, ajustadas proporcionalmente ao espaço disponível, sem distorção. Todos os ajustes e textos do estudo de áudio ficam em um painel branco à esquerda, que pode ser ocultado ou reaberto. O transporte é discreto, centralizado na parte inferior: reproduzir/pausar, voltar ao início, silenciar/ativar som e barra de tempo. O campo mantém #101312 e a forma #cccccc.

**Experimento anterior — por entradas (15/09/2026).** Uma única silhueta cresce para a direita. Cada entrada selecionada inicia um trecho de 96 px, cuja ponta cresce e transforma seu perfil em até 120 ms, ou menos se houver outro evento antes. A transição usa o relógio do áudio e começa no instante do evento; 120 ms é duração da transformação, não compensação de atraso. Os trechos concluídos permanecem congelados. Entre eventos, após terminar a reação, corpo e câmera ficam imóveis.

Quando o comprimento ultrapassa a janela, a câmera acompanha apenas o crescimento da ponta. O botão **Ver figura inteira** enquadra todo o histórico criado até o instante atual. Pausar, buscar e mudar de enquadramento não apagam esse histórico. O eixo horizontal desse experimento representa **ordem dos eventos**, não duração proporcional: intervalos longos são percebidos como pausas no avanço. O modo de visão inteira reduz a escala de todos os trechos para caber na tela.

**Comparação anterior — formas separadas.** As formas nascem na borda direita e se deslocam continuamente para a esquerda. A velocidade padrão é 80 px/s. Neste modo, o eixo horizontal permanece proporcional ao tempo. A seleção **Forma e movimento** permite comparar os dois modos no mesmo instante, pausando ao trocar.

Os dois modos anteriores reutilizam os mesmos descritores, eventos, pesos e arquivo de áudio; o fluxo simétrico acrescenta as medidas por faixas descritas acima. A mudança de topologia é uma hipótese formal autorizada para teste, ainda sem aprovação perceptual. Não foi acrescentada estimativa de beat: entradas detectadas podem coincidir com batidas, mas não equivalem ao pulso musical.

### Nascimento de formas nos modos anteriores

No fluxo simétrico, a construção é contínua e os ataques graves somente deformam o corpo. Nos modos anteriores:

Modo primário: uma forma nasce a cada onset cuja força ultrapasse um limiar configurável, respeitando um intervalo mínimo entre nascimentos, para evitar saturação. Comece com limiar em 0.4 e intervalo mínimo de 250 ms, e deixe ambos ajustáveis.

Modo secundário, para comparação: uma forma nasce a cada intervalo fixo de tempo. Deve ser possível alternar entre os dois modos por uma variável na configuração.

Cada evento congela os valores locais de `eventos` ou de `valores_evento`, nunca a curva suavizada de inspeção. A lista de eventos é calculada com o mesmo limiar e intervalo usados nos diagnósticos; se esses parâmetros mudarem, a seleção precisa ser refeita. Na forma contínua, esses valores definem o perfil alvo da ponta; somente o trecho ativo passa pela transição de até 120 ms. Ao concluir, sua geometria fica congelada. Na comparação anterior, a forma já nasce com sua geometria final.

### Geometria dos estudos anteriores

O contorno de origem e o modo de formas separadas usam um contorno fechado em coordenadas polares com N pontos de controle. O parâmetro que morfa entre redondo e pontudo é a interpolação entre uma curva suave passando pelos pontos e a ligação reta entre eles.

```js
// a = 0 é bouba, curva suave
// a = 1 é kiki, polígono de arestas retas
// A interpolação é linear entre as duas versões do mesmo ponto.
```

Angularidade:

```
base = p_centroide · centroide + p_continuidade · descontinuidade
a = base + ganho_ataque · ataque_do_evento · (1 − base)
```

Os pesos `p_centroide` e `p_continuidade` ficam na configuração, com 0,5 e 0,5 como ponto de partida. Os pesos são não negativos e somam 1. O ganho de ataque começa em 0,25 e ocupa apenas uma fração do espaço restante até 1. A contribuição usa o ataque do próprio evento; se indisponível, a forma usa a base. O valor congela ao nascer. A cauda de 150 ms existe apenas no gráfico diagnóstico. O ganho é decisão propositiva e será avaliado visualmente.

**União no experimento contínuo.** O contorno de origem é projetado em duas bordas (superior e inferior), amostradas em 129 posições ao longo do trecho. Uma janela sen² aproxima as bordas de uma ligação central de 10 px nas extremidades. O perfil da ponta interpola a projeção anterior e a atual enquanto o novo trecho se expande. Não há cópias independentes sobrepostas: as bordas compõem um único contorno fechado e preenchido.

O RMS continua definindo o raio base de 20–90 px do contorno de origem; a projeção e a ligação central alteram a silhueta resultante, portanto esse raio não é uma medida exata da extensão visível da coluna. Angularidade, aspereza e planura alimentam o mesmo contorno de origem, mas a projeção pode reduzir a visibilidade de certas concavidades e texturas. Isso precisa ser avaliado visualmente.

A posição vertical usa o mesmo descritor, agora em uma faixa de até 28% da altura do campo, com reserva para o relevo. A redução da excursão mantém a conexão legível. É uma decisão formal do teste, assim como 96 px por evento, 120 ms de transição, janela de união e espessura central. Nenhum desses números é resultado perceptual validado.

Parâmetros de cada forma:

| parâmetro | origem | faixa inicial | linha da tabela |
|---|---|---|---|
| angularidade | centroide, descontinuidade e pico de ataque | 0,0 a 1,0 | 1 e 2 |
| raio base | RMS | 20 a 90 px | 4 |
| número de pontos de controle | fixo na configuração | padrão 9 | nenhuma |
| irregularidade da borda | aspereza | harmônicos 8 a 24 do contorno | 5 |
| granulação (desligada por padrão) | planura espectral | 0 a 20 por cento do raio | 7 |
| posição vertical | F0 local válida em ERB-rate, ou centroide do modo escolhido se a F0 falhar | agudo em cima | 3 |
| cor | valência e excitação | ver abaixo | 6 |

O número de pontos é fixo porque não há fonte para ligá-lo ao som, e porque o centroide já move três coisas. Se o mesmo descritor mover tudo, os canais deixam de ser distinguíveis na tela.

A irregularidade da borda usa harmônicos altos do contorno porque aspereza é modulação rápida de amplitude, e a taxa de modulação de amplitude se associa à frequência espacial visual; formas angulares têm frequência espacial mais alta (F18, p. 2646).

### Cor

Um gradiente suave, não uma paleta de blocos. A cor vem só de valência e excitação. Nenhum descritor de áudio mexe na cor.

O espaço de trabalho é CIE LCh (luminosidade, croma, matiz), representação cilíndrica do CIE Lab usado por Lindborg & Friberg (F11). A configuração guarda quatro cores de canto, e a cor de cada forma é a interpolação bilinear entre elas, com a restrição de luminosidade definida após a tabela. As posições usadas na interpolação são a valência e a excitação convertidas da escala fixa de 1 a 9 (seção 7).

| canto | ponto de partida | apoio |
|---|---|---|
| valência alta, excitação alta | amarelo-alaranjado, claro, saturado | alegria puxa amarelo (F11, p. 1); música rápida e em modo maior puxa cor mais clara, saturada e amarela (F20, p. 8837); vermelho, laranja e amarelo saturados ficam em excitação e valência altas (F21, p. 15) |
| valência baixa, excitação alta | vermelho escuro e intenso | raiva puxa manchas grandes e vermelhas (F11, p. 1); excitação puxa cor mais vermelha (.75), saturada (.72) e escura (−.55) (F21, p. 11); o trecho de heavy metal puxou pretos e vermelhos escuros (F21, p. 19); rostos com raiva puxaram vermelhos escuros (F20, p. 8839) |
| valência baixa, excitação baixa | azul escuro, pouco saturado | tristeza puxa manchas menores em azul escuro (F11, p. 1); música lenta e em modo menor puxa cor escura, pouco saturada e azulada (F20, p. 8837); cinzas e azuis escuros ficam em excitação e valência baixas (F21, p. 15) |
| valência alta, excitação baixa | verde claro, pouco saturado | nesse quadrante ficam sobretudo cores claras: verde, amarelo, lilás, ciano e azul (F21, Figura 5a, p. 16, leitura da figura); música agradável e harmoniosa puxa cor mais clara, pouco saturada e levemente esverdeada (F21, p. 13); música lenta em modo maior puxa cor mais verde (F20, p. 8837); rostos calmos puxam cor clara, pouco saturada e levemente fria (F20, p. 8839). O tom exato dentro da família clara é escolha estética |

Regras de eixo, adotadas como decisões de projeto informadas pelos estudos:
- luminosidade cresce com a valência: há associação positiva em F21 (.48, p. 11). Em F20, música em modo maior foi associada a cores mais claras (p. 8837), um resultado relacionado, mas não uma medida idêntica. Em F11, alegria ficou mais clara que raiva, medo e tristeza (p. 11), porém a comparação direta entre valência alta e baixa não mostrou diferença estatisticamente significativa de luminosidade (p = .19, Tabela 5, p. 14). O apoio é parcial; não é um efeito confirmado da mesma maneira nos três estudos
- croma cresce com a excitação (F21, .72, p. 11; em F20, música rápida puxou cor mais saturada, p. 8837)
- matiz: a excitação puxa para o vermelho (F21, .75, p. 11); a valência puxa para o amarelo (F21, .47, p. 11; F20, p. 8837)
- a excitação não mexe na luminosidade no protótipo. Essa separação é uma decisão de projeto diante de resultados diferentes: energia alta clareou a cor em F11 (Tabelas 4 e 5, p. 14) e música rápida clareou em F20 (p. 8837), enquanto em F21 a excitação escureceu (−.55, p. 11). Os autores de F21 atribuem a diferença de andamento ao repertório: ali, música rápida também era pesada e marcada (p. 12). Energia, andamento e excitação são medidas relacionadas, mas não equivalentes.

**Restrição da interpolação:** os dois cantos de valência baixa compartilham um único valor de luminosidade, `L_baixa`; os dois de valência alta compartilham `L_alta`, com `0 ≤ L_baixa < L_alta ≤ 100`. Esses dois valores ficam na configuração e serão escolhidos no ajuste visual. Croma e matiz podem diferir entre os cantos, seguindo as direções acima. Assim, na interpolação bilinear, a luminosidade se reduz a `L = (1 − v) × L_baixa + v × L_alta`, em que `v` é a valência convertida para 0 a 1. Mudar apenas a excitação mantém L constante. Não basta escolher duas cores descritas como “claras” ou “escuras”: os respectivos valores de L devem ser iguais.

Limites a declarar:
- o eixo de matiz que mais pesa depende do repertório: com música variada, a emoção explicou 58,3% do vermelho-verde e só 33,3% do amarelo-azul (F21, p. 18); no repertório clássico de F20, o amarelo-azul era forte (F21, p. 10)
- as fontes dão direções medidas com uma paleta fixa de 37 cores (F20, F21), não tons contínuos
- participantes dos Estados Unidos e do México em Palmer (F20), dos Estados Unidos em Whiteford (F21) e de Singapura em Lindborg & Friberg (F11); o Brasil não foi testado nesses estudos

Conflito com o fundo: o fundo escuro é decisão da autora (seção 4). Os cantos de valência baixa são escuros por apoio da literatura, e formas vermelho-escuras ou azul-escuras podem perder contraste sobre ele. Nos testes, ajustar o mínimo comum `L_baixa` para preservar a legibilidade sobre o fundo escuro, mantendo-o abaixo de `L_alta`. O ajuste deve valer para os dois cantos de mesma valência; não clarear apenas uma cor em função da excitação. Registrar os valores escolhidos e o eventual desvio da direção estética inicial. Ver pendências (seção 11).

A rampa exata dos cantos sai da leitura das imagens em `referencias-visuais/`, dentro dessas direções.

Cada forma pode ter um gradiente interno leve seguindo a mesma lógica, do centro para a borda. Leve. Se o gradiente chamar atenção para si, está forte demais.

Enquanto a emoção não estiver implementada (ordem de entrega, item 5), as formas ficam em cinza neutro.

### Camadas

O protótipo desenha uma forma por evento, a partir do áudio inteiro misturado. O trabalho trata a mistura polifônica como um timbre só, e não há separação de instrumentos no escopo.

Por organização de código, a função de desenho recebe uma camada como argumento e o laço principal itera sobre uma lista de camadas, com um único item. Isso não é promessa de separar instrumentos, e o texto da monografia não deve apresentar como tal.

### Aceite da etapa B

A verificação é técnica, sem pessoas. Ao tocar o trecho:

1. Nos dois momentos anotados na seção 5, as formas do trecho de timbre escuro precisam ser visivelmente mais arredondadas do que as do trecho de timbre brilhante. Se a F0 estiver sendo usada, a altura na tela deve seguir a F0, não o centroide.
2. Nos quadros de RMS acima do percentil 80, o raio médio das formas deve ser maior do que nos quadros abaixo do percentil 20.
3. Os 32 estímulos inspirados em Fort são mostrados numa grade de 8 frequências por 4 vales, como inspeção da contribuição de base. Registrar inversões em vez de apresentá-la como réplica do artigo. O contraste da fórmula completa é verificado com eventos controlados, separadamente.
4. Nenhuma forma deve piscar, tremer ou saltar de posição. No experimento contínuo, conferir também as uniões durante a transformação, a imutabilidade dos trechos concluídos, a imobilidade entre reações e a reconstrução ao buscar no áudio. O avanço curto por evento é intencional e suavizado.

Na etapa de emoção e cor, verificar também: a conversão fixa de 1, 5 e 9 para 0, 0,5 e 1; a preservação de valores próximos do centro e de medidas indisponíveis; a constância de L ao variar apenas a excitação; e o contraste dos quatro cantos sobre o fundo escuro. São verificações de implementação e legibilidade, não validação perceptual da associação entre música e cor.

Se houver falha, conferir extração, normalização, seleção de eventos, implementação gráfica e hipótese de mapeamento. Não atribuir automaticamente a falha a uma única camada.

---

## 9. Configuração

Tudo abaixo fica em arquivos de configuração comentados em português, separados da lógica:

estrutura fluxo simétrico/por entradas/separada, ganhos de agudos e graves, faixas de frequência, suavização harmônica, duração do acento, resolução do palco, comprimento por evento, duração da reação, espessura da ligação, faixa vertical do corpo contínuo, velocidade do scroll, limiar de onset, intervalo mínimo entre formas, modo de nascimento, faixas de cada parâmetro visual, pesos da angularidade, número de pontos de controle, janela da descontinuidade, liga/desliga da planura, substituto da F0, constantes de suavização, compensação de atraso, cores de canto da emoção (com `L_baixa` e `L_alta` compartilhados por valência), origem da emoção (modelo ou anotação), tamanho do canvas, opacidade do rastro. Os limites emocionais de 1 e 9 são fixos e registrados; não são recalibrados automaticamente.

A pessoa precisa conseguir mudar qualquer um desses valores, salvar, recarregar a página e ver a diferença. Sem editar código.

---

## 10. Ordem de entrega

1. Análise rodando, JSON e gráficos gerados, contraste exploratório registrado, testes de cálculo executados e teste sintético inspirado em Fort documentado com seus limites e falhas.
2. Forma estática desenhada na tela, com controles deslizantes manuais, sem áudio nenhum. Testar se cada parâmetro faz o que se espera.
3. Scroll funcionando com formas nascendo em intervalo fixo, ainda sem áudio.
4. Ligação com o JSON e sincronia com o áudio.
   - Antes de emoção e cor: experimento de corpo contínuo (primeiro por eventos, depois fluxo simétrico por faixas), avanço fluido e interface minimalista; comparar com a estrutura anterior e avaliar com a autora.
5. Emoção e cor. Ajuste fino das faixas e das cores.

Cada etapa é entregue e verificada antes da seguinte.

Estado em 15/09/2026: etapas 2, 3 e 4 implementadas em `protótipo_v1/visual/index.html`, com alternância entre forma estática, movimento manual e reprodução com áudio. O áudio dirige o tempo da partitura, permite pausa/busca e oferece as leituras de ênfase nas entradas e mistura completa. A seleção é refeita ao mudar força mínima ou intervalo; há também nascimento por intervalo fixo, sem ataque associado. Alterar a leitura pausa e reconstrói a comparação no mesmo instante. As conferências estão em `protótipo_v1/visual/VERIFICACAO.md`, `protótipo_v1/visual/VERIFICACAO-MOVIMENTO.md` e `protótipo_v1/visual/VERIFICACAO-AUDIO.md`. Foi medido o atraso do desenho em relação ao relógio do player; a latência física de áudio/tela e a avaliação visual pela autora continuam abertas. Antes de emoção e cor, foram incluídos os testes estruturais da seção 8. Em 16/09/2026, o padrão passou a ser **Fluxo simétrico**, com avanço contínuo, expansão espelhada e leituras separadas para gesto sustentado e ataques graves. A interface ao redor do campo foi simplificada com referência em https://colirio-halftone.vercel.app/: branco, texto preto, linhas finas e controles secundários recolhidos. O campo de desenho mantém #101312 e a forma #cccccc. Registros em `protótipo_v1/visual/VERIFICACAO-CONTINUA.md` (experimento anterior) e `protótipo_v1/visual/VERIFICACAO-FLUXO.md` (correção atual). A avaliação deste teste pela autora vem antes de avançar para emoção e cor, ainda não implementadas.

---

## 11. Pendências que a autora precisa resolver

No protótipo:
- Assimetria da posição vertical. Eitan & Granot (F04) mostram que descida de altura puxa verticalidade com mais força que subida, e o cap. 5.2 diz que o mapeamento espelhado não é adotado. O PRD ainda usa posição simétrica. Decidir como a assimetria entra (por exemplo, ganhos diferentes para subida e descida em relação à forma anterior) e declarar.
- Avaliação visual dos pesos preservados (0,5/0,5) e do ganho limitado de ataque (0,25).
- Liew × Zacharakis na linha 5: confirmar que o protótipo segue Liew e escrever isso no texto.
- Contraste entre os cantos escuros (valência baixa) e o fundo escuro: decidir nos testes e declarar (seção 8, Cor).
- Tom exato de cada canto de cor e rampa dos quatro cantos, dentro das direções da seção 8, a partir das referências visuais.

Na bibliografia e nos capítulos (fora do PRD):
- Referências que entram via outro autor e precisam ser lidas no original ou citadas com apud: Marks 1987a, Smith & Sera 1992, Lipscomb & Kim 2004, Gallace & Spence 2006, Evans & Treisman 2010, Vroomen & Keetels 2010, Guzman-Martinez et al. 2012, Glasberg & Moore 1990. Dados completos no anexo.
- Os estímulos de Zacharakis et al. (2015) não são tons sintéticos, como dizem o cap. 5.2 e a bibliografia categorizada. São 15 amostras gravadas de instrumento, uma flauta e 8 sons de sintetizador e eletromecânicos. No teste de dissimilaridade, todos ficaram na classe de altura Lá, de 55 a 440 Hz, cortados em 1,3 s (F19, p. 396). Corrigir o texto.
- Passi & Arun: publicado online em dezembro de 2022, volume de 2024 da revista. Escolher uma data e não misturar.
- Liew et al. (2017): o PDF não traz onde foi publicado. Encontrar os anais antes de citar.
- Hamilton-Fletcher et al. (2017): o PDF é a versão aceita, sem paginação da revista. Conferir volume e páginas.
- Erdmann et al. (2025) e Lembke (2023) ainda não estão na bibliografia categorizada. O primeiro entra no cap. 3, em 3.1; o segundo em 2.4.

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
