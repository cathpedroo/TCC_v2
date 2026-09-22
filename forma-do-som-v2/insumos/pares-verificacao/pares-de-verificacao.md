# Pares de instantes para verificar o protótipo v2

Gerado em 18/09/2026 por `procurar_pares.py` sobre `audio-prototipo.mp3`, com a leitura causal do v2 (FFT 2048, salto 1024, suavização 140/180 ms, ataques com as três travas).

## Para que servem

Cada par é dois instantes do mesmo trecho que **diferem muito numa medida e pouco em todas as outras**. Isso permite testar uma linha da tabela de mapeamento de cada vez: se a forma muda entre os dois, foi aquela medida que causou. Um instante sozinho não prova nada.

Os mesmos pares servem de figura no capítulo, porque o modo arquivo é determinístico: o quadro de 6,64 s é sempre o mesmo quadro.

"Ruído" abaixo é a maior diferença entre os dois instantes em qualquer medida que **não** é a testada. Quanto menor, mais limpo o par.

---

## Par 1 — brilho · testa V6 e V2

**6,64 s × 4,78 s.** Ruído: 18 pontos.

| medida | 6,64 s | 4,78 s |
|---|---|---|
| **brilho médio-agudo** | **1.076 Hz** | **2.397 Hz** |
| volume médio-agudo | 34% | 53% |
| volume grave | 30% | 15% |
| angularidade médio-aguda | 0,75 | 0,95 |
| distribuição y médio-aguda | 1% | 100% |

O brilho mais que dobra. **Atenção ao resultado:** a angularidade anda só 0,20, enquanto a distribuição y anda a faixa inteira. Ver a ressalva no fim deste documento.

## Par 2 — volume médio-agudo · testa V1

**2,14 s × 34,32 s.** Ruído: 8 pontos. **O par mais limpo.**

| medida | 2,14 s | 34,32 s |
|---|---|---|
| **volume médio-agudo** | **0%** | **100%** |
| brilho médio-agudo | 1.838 Hz | 1.942 Hz |
| volume grave | 70% | 72% |
| angularidade médio-aguda | 0,88 | 0,90 |

Brilho, volume grave e angularidade praticamente idênticos. Só a extensão x da forma média-aguda pode mudar. Se mudar outra coisa, há acoplamento indevido no código.

## Par 3 — acento grave · testa V3

**17,41 s × 25,03 s.** Ruído: 7 pontos. **O segundo mais limpo.**

| medida | 17,41 s | 25,03 s |
|---|---|---|
| **acento** | **0%** | **93%** |
| volume grave | 19% | 25% |
| volume médio-agudo | 80% | 83% |
| brilho grave | 87% | 88% |
| angularidade grave | 0,21 | 0,21 |

Um instante em repouso e um no pico de um ataque, com todo o resto igual. É o par que mostra o impacto sozinho.

## Par 4 — volume grave · testa V4

**19,46 s × 37,94 s.** Ruído: 26 pontos. **O menos limpo dos quatro, e não dá para melhorar.**

| medida | 19,46 s | 37,94 s |
|---|---|---|
| **volume grave** | **3%** | **94%** |
| brilho grave | 70% | 45% |
| volume médio-agudo | 58% | 33% |

Nesta música, volume e brilho da faixa grave andam juntos: quando o grave fica forte é porque uma fundamental baixa está soando, e isso puxa o centroide da faixa para baixo. É fato musical, não defeito do detector. Usar este par com a ressalva escrita na legenda, ou verificar V4 com sinal sintético em vez de com a música.

---

## Ressalva que saiu desta medição: a angularidade quase não anda

No par 1 o brilho vai de 1.076 a 2.397 Hz, mais que o dobro, e a angularidade da forma média-aguda vai de 0,75 a 0,95 — 0,20 num parâmetro que vale de 0 a 1. Quem se move é o eixo y, de 1% a 100%. A correspondência com mais apoio do projeto seria a que menos se vê na tela.

**Primeiro diagnóstico, errado, registrado porque foi tentado.** Pensou-se que a régua tinha um buraco: entre as duas faixas há a região de 220 a 350 Hz, que nenhuma forma lê. A ideia era quebrar a régua nas bordas das faixas para comprimir esse vão. Medido em `testar_regua.py`, **piorou**: a variação caiu de 0,22 e 0,17 para 0,16 e 0,13. A região morta ocupa só ~12% da régua linear, e quebrar nas bordas das faixas alarga a régua de 5,7 para 7,6 oitavas, dando a cada faixa uma fatia menor.

**Causa real.** Cada faixa ocupa 1,6 a 1,8 oitava de uma régua de 5,7 oitavas: cada forma usa cerca de um quarto dela. É inerente a qualquer régua absoluta larga o bastante para as duas faixas. O vão entre as janelas ocupadas, de 170 a 855 Hz, é frequência legítima que **esta gravação não usa** — comprimi-lo é calibrar para o material, não tapar um buraco.

**Solução medida: expandir onde o som está.**

| régua | forma grave | média-aguda | folga | par 1 |
|---|---|---|---|---|
| linear, 55–2.913 Hz | 0,22 | 0,17 | 0,50 | 0,20 |
| quebrada nas bordas das faixas | 0,16 | 0,13 | 0,39 | 0,15 |
| **expansão calibrada, 0,35 cada** | **0,35** | **0,35** | **0,22** | **0,36** |

Adotada no PRD 4.4, seção 5. Monótona e absoluta, então F14 continua valendo; calibrada ao material, então os pontos de quebra entram na calibração e precisam ser remedidos para outra gravação.

Conferir com o par 1 depois de implementar: a angularidade tem de andar em torno de 0,35. Se andar 0,20, a expansão não foi aplicada.
