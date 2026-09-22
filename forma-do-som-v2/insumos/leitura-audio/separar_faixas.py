"""Separa o áudio do protótipo em faixas de frequência, para ouvir cada uma em separado.

Isto é filtragem, não separação de instrumentos: o que soa na mesma faixa continua junto.
Serve para conferir de ouvido o que cada faixa da análise está medindo.

Rodar a partir da pasta PROJETO:
    protótipo_v1/.venv/bin/python -B leitura-audio/separar_faixas.py

Saída em leitura-audio/saida/faixas/: um .wav por faixa e um resumo em Markdown.
"""

from pathlib import Path
from datetime import datetime

import numpy as np
import librosa
import soundfile as sf
from scipy.signal import butter, sosfiltfilt, sosfreqz

# ---------------------------------------------------------------- configuração
PASTA = Path(__file__).resolve().parent
AUDIO = PASTA.parent / "protótipo_v1" / "audio-prototipo" / "audio-prototipo.mp3"
SAIDA = PASTA / "saida" / "faixas"

# Ordem do filtro: quanto maior, mais abrupto o corte. 4 é um meio-termo comum.
ORDEM = 4

# As duas primeiras faixas são as que o protótipo usa hoje (README do protótipo).
# "resto" reúne o que fica de fora das duas, para ouvir o que a análise está ignorando.
FAIXAS = [
    ("grave", 30.0, 220.0),
    ("medio-agudo", 350.0, 6000.0),
    ("fora-das-faixas", None, None),
]


def filtrar(y, sr, corte_baixo, corte_alto):
    """Deixa passar o que está entre os dois cortes. Filtro aplicado nos dois sentidos,
    o que mantém os instantes no lugar (sem atraso). Num sistema ao vivo isso não é possível."""
    nyquist = sr / 2
    if corte_baixo and corte_alto:
        sos = butter(ORDEM, [corte_baixo / nyquist, min(corte_alto, nyquist * 0.99) / nyquist], btype="bandpass", output="sos")
    elif corte_baixo:
        sos = butter(ORDEM, corte_baixo / nyquist, btype="highpass", output="sos")
    else:
        sos = butter(ORDEM, corte_alto / nyquist, btype="lowpass", output="sos")
    return sosfiltfilt(sos, y)


def energia_db(x):
    return 10 * np.log10(float(np.sum(x ** 2)) + 1e-12)


def decimal(x, casas=1):
    return f"{x:.{casas}f}".replace(".", ",")


def main():
    SAIDA.mkdir(parents=True, exist_ok=True)
    y, sr = librosa.load(AUDIO, sr=None, mono=True)
    total = energia_db(y)

    linhas = ["# Faixas separadas do áudio do protótipo", "",
              f"Gerado em {datetime.now():%d/%m/%Y %H:%M} por `leitura-audio/separar_faixas.py`. "
              f"Arquivo: `audio-prototipo.mp3`, lido em mono a {sr} Hz. Filtro Butterworth de ordem {ORDEM}, "
              "aplicado nos dois sentidos para não deslocar os instantes.", "",
              "Cada arquivo tem só a parte do som naquela faixa de frequência. Os instrumentos que dividem a "
              "mesma faixa continuam misturados: isto é filtragem, não separação de fontes.", "",
              "| Arquivo | Faixa | Energia | Pico |", "|---|---|---|---|"]

    soma_filtradas = np.zeros_like(y)
    for nome, baixo, alto in FAIXAS:
        if nome == "fora-das-faixas":
            x = y - soma_filtradas
            descricao = "o que sobra: abaixo de 30 Hz, entre 220 e 350 Hz e acima de 6.000 Hz"
            arquivo = SAIDA / "fora-das-faixas.wav"
        else:
            x = filtrar(y, sr, baixo, alto)
            soma_filtradas = soma_filtradas + x
            descricao = f"{decimal(baixo, 0)} a {decimal(alto, 0)} Hz"
            arquivo = SAIDA / f"{nome}_{int(baixo)}-{int(alto)}Hz.wav"
        pico = float(np.max(np.abs(x)))
        if pico > 0.999:  # evita estouro depois da filtragem
            x = x / pico * 0.98
            pico = 0.98
        sf.write(arquivo, x.astype(np.float32), sr, subtype="PCM_24")
        linhas.append(f"| `{arquivo.name}` | {descricao} | {decimal(energia_db(x) - total)} dB em relação à mistura | "
                      f"{decimal(20 * np.log10(pico + 1e-12))} dBFS |")

    linhas += ["", "## Como ouvir", "",
               "- `grave_30-220Hz.wav`: a faixa que o protótipo usa para os ataques graves.",
               "- `medio-agudo_350-6000Hz.wav`: a faixa da leitura sustentada, que desenha a curva suave.",
               "- `fora-das-faixas.wav`: o que nenhuma das duas mede. Se soar algo importante aqui, os limites "
               "das faixas merecem revisão.", "",
               "## Limites", "",
               "- Filtrar não separa instrumentos. Um violão com corda grave e corda aguda aparece nos dois arquivos.",
               "- As bordas do filtro são graduais: perto do corte, o som some aos poucos, não de uma vez.",
               "- A soma das três faixas reconstrói a mistura, então as energias não somam 100 % de forma simples.",
               "- Filtrar nos dois sentidos só funciona com o arquivo inteiro na mão. Ao vivo, um filtro atrasa o som."]

    (SAIDA / "faixas.md").write_text("\n".join(linhas), encoding="utf-8")
    print("\n".join(linhas[5:]))


if __name__ == "__main__":
    main()
