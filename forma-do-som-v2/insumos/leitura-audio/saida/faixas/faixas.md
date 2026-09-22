# Faixas separadas do áudio do protótipo

Gerado em 17/09/2026 16:13 por `leitura-audio/separar_faixas.py`. Arquivo: `audio-prototipo.mp3`, lido em mono a 44100 Hz. Filtro Butterworth de ordem 4, aplicado nos dois sentidos para não deslocar os instantes.

Cada arquivo tem só a parte do som naquela faixa de frequência. Os instrumentos que dividem a mesma faixa continuam misturados: isto é filtragem, não separação de fontes.

| Arquivo | Faixa | Energia | Pico |
|---|---|---|---|
| `grave_30-220Hz.wav` | 30 a 220 Hz | -1,2 dB em relação à mistura | -0,2 dBFS |
| `medio-agudo_350-6000Hz.wav` | 350 a 6000 Hz | -9,2 dB em relação à mistura | -1,2 dBFS |
| `fora-das-faixas.wav` | o que sobra: abaixo de 30 Hz, entre 220 e 350 Hz e acima de 6.000 Hz | -16,7 dB em relação à mistura | -8,2 dBFS |

## Como ouvir

- `grave_30-220Hz.wav`: a faixa que o protótipo usa para os ataques graves.
- `medio-agudo_350-6000Hz.wav`: a faixa da leitura sustentada, que desenha a curva suave.
- `fora-das-faixas.wav`: o que nenhuma das duas mede. Se soar algo importante aqui, os limites das faixas merecem revisão.

## Limites

- Filtrar não separa instrumentos. Um violão com corda grave e corda aguda aparece nos dois arquivos.
- As bordas do filtro são graduais: perto do corte, o som some aos poucos, não de uma vez.
- A soma das três faixas reconstrói a mistura, então as energias não somam 100 % de forma simples.
- Filtrar nos dois sentidos só funciona com o arquivo inteiro na mão. Ao vivo, um filtro atrasa o som.