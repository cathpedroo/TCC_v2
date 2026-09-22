"""Leitura descritiva do áudio do protótipo: frequências, notas prováveis, acordes e tonalidade.

Serve para dar nome ao que soa, não para alimentar o desenho. Não altera nada em protótipo_v1/.

Rodar a partir da pasta PROJETO:
    protótipo_v1/.venv/bin/python -B leitura-audio/ler_audio.py

Saída em leitura-audio/saida/: relatório em Markdown e duas figuras.
"""

from pathlib import Path
from datetime import datetime

import numpy as np
import librosa
import librosa.display
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy.signal import find_peaks

# ---------------------------------------------------------------- configuração
PASTA = Path(__file__).resolve().parent
AUDIO = PASTA.parent / "protótipo_v1" / "audio-prototipo" / "audio-prototipo.mp3"
SAIDA = PASTA / "saida"

TRECHO_S = 2.0            # tamanho de cada trecho lido, em segundos
N_FFT = 8192              # janela longa: ~5,4 Hz por faixa a 44,1 kHz, boa para separar notas graves
SALTO = 2048
FREQ_MIN, FREQ_MAX = 30.0, 5000.0   # onde procurar picos
PROEMINENCIA_DB = 10.0    # quanto um pico precisa se destacar dos vizinhos
ABAIXO_DO_MAIOR_DB = 45.0 # ignora picos mais fracos que o maior do trecho menos este valor
MAX_PICOS = 8
# Incerteza da frequência de cada pico, em Hz. Um pico P é marcado como possível n-ésimo harmônico
# de Q quando |P − n×Q| ≤ (n + 1) × esta incerteza (o erro de Q cresce n vezes ao multiplicar).
INCERTEZA_HZ = 0.7

# Faixas usadas no fluxo simétrico do protótipo (README do protótipo).
FAIXA_GRAVE = (30.0, 220.0)
FAIXA_MEDIO_AGUDA = (350.0, 6000.0)

NOMES_PT = ["Dó", "Dó♯", "Ré", "Ré♯", "Mi", "Fá", "Fá♯", "Sol", "Sol♯", "Lá", "Lá♯", "Si"]
NOMES_EN = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"]

# Perfis de Krumhansl e Kessler (1982) para estimar tonalidade maior e menor.
PERFIL_MAIOR = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
PERFIL_MENOR = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])


# ---------------------------------------------------------------- nomes
def nome_da_frequencia(hz):
    """440 Hz -> ('Lá4', 'A4', 0): nota mais próxima, em notação científica (Dó4 = dó central), e desvio em cents."""
    midi = 69 + 12 * np.log2(hz / 440.0)
    inteiro = int(round(midi))
    cents = int(round(100 * (midi - inteiro)))
    classe, oitava = inteiro % 12, inteiro // 12 - 1
    return f"{NOMES_PT[classe]}{oitava}", f"{NOMES_EN[classe]}{oitava}", cents


def formatar_nota(hz):
    pt, en, cents = nome_da_frequencia(hz)
    sinal = f"{cents:+d} c" if cents else "afinado"
    return f"{pt} ({en}, {sinal})"


def decimal(x, casas=2):
    return f"{x:.{casas}f}".replace(".", ",")


def formatar_hz(hz):
    return f"{hz:,.1f}".replace(",", "X").replace(".", ",").replace("X", ".")


# ---------------------------------------------------------------- medidas
def picos_do_trecho(potencia_media, freqs):
    """Picos do espectro médio de um trecho, com frequência refinada por interpolação parabólica."""
    db = 10 * np.log10(potencia_media + 1e-12)
    faixa = (freqs >= FREQ_MIN) & (freqs <= FREQ_MAX)
    indices_faixa = np.where(faixa)[0]
    maior = db[faixa].max()
    idx, _ = find_peaks(db[faixa], prominence=PROEMINENCIA_DB, height=maior - ABAIXO_DO_MAIOR_DB)
    picos = []
    for i in indices_faixa[idx]:
        a, b, c = db[i - 1], db[i], db[i + 1]
        desloc = 0.5 * (a - c) / (a - 2 * b + c) if (a - 2 * b + c) != 0 else 0.0
        hz = freqs[i] + desloc * (freqs[1] - freqs[0])
        picos.append({"hz": hz, "db": b, "relativo_db": b - maior})
    picos.sort(key=lambda p: p["db"], reverse=True)
    picos = picos[:MAX_PICOS]
    # Marca picos que podem ser harmônicos de um pico mais grave e forte o bastante.
    for p in picos:
        p["harmonico_de"] = None
        for q in sorted(picos, key=lambda x: x["hz"]):
            if q["hz"] >= p["hz"] or q["db"] < p["db"] - 12:
                continue
            n = round(p["hz"] / q["hz"])
            if 2 <= n <= 8 and abs(p["hz"] - n * q["hz"]) <= (n + 1) * INCERTEZA_HZ:
                p["harmonico_de"] = (q["hz"], n)
                break
    return picos


def energia_da_faixa_db(potencia_media, freqs, faixa):
    sel = (freqs >= faixa[0]) & (freqs < faixa[1])
    return 10 * np.log10(potencia_media[sel].sum() + 1e-12)


def acorde_provavel(croma):
    """Compara o croma médio com as 24 tríades maiores e menores. Devolve o nome e a semelhança (0 a 1)."""
    v = croma / (np.linalg.norm(croma) + 1e-12)
    melhor = ("", -1.0)
    for raiz in range(12):
        for tipo, intervalos in (("maior", (0, 4, 7)), ("menor", (0, 3, 7))):
            molde = np.zeros(12)
            molde[[(raiz + k) % 12 for k in intervalos]] = 1
            sem = float(v @ (molde / np.linalg.norm(molde)))
            if sem > melhor[1]:
                melhor = (f"{NOMES_PT[raiz]} {tipo}", sem)
    return melhor


def tonalidade_provavel(croma_total):
    resultados = []
    for raiz in range(12):
        for tipo, perfil in (("maior", PERFIL_MAIOR), ("menor", PERFIL_MENOR)):
            r = np.corrcoef(croma_total, np.roll(perfil, raiz))[0, 1]
            resultados.append((r, f"{NOMES_PT[raiz]} {tipo}"))
    resultados.sort(reverse=True)
    return resultados[:3]


# ---------------------------------------------------------------- figuras
def figura_espectro(y, sr, caminho):
    S = librosa.amplitude_to_db(np.abs(librosa.stft(y, n_fft=N_FFT, hop_length=SALTO)), ref=np.max)
    fig, ax = plt.subplots(figsize=(14, 7))
    librosa.display.specshow(S, sr=sr, hop_length=SALTO, x_axis="time", y_axis="log", ax=ax, cmap="magma", vmin=-80)
    notas_c = [librosa.note_to_hz(f"C{o}") for o in range(1, 9)]
    ax.set_yticks(notas_c)
    ax.set_yticklabels([f"Dó{o} · {formatar_hz(h)} Hz" for o, h in zip(range(1, 9), notas_c)])
    ax.set_ylim(FREQ_MIN, 8000)
    for limite, cor in ((FAIXA_GRAVE[1], "#4dd0e1"), (FAIXA_MEDIO_AGUDA[0], "#ffd54f"), (FAIXA_MEDIO_AGUDA[1], "#ffd54f")):
        ax.axhline(limite, color=cor, lw=1, ls="--")
    ax.set_title("Espectrograma: quanto de cada frequência soa ao longo do tempo "
                 "(azul: limite dos graves, 220 Hz; amarelo: médios-agudos, 350–6.000 Hz)")
    ax.set_xlabel("tempo (s)")
    ax.set_ylabel("frequência (escala logarítmica; marcas em cada Dó)")
    fig.tight_layout()
    fig.savefig(caminho, dpi=130)
    plt.close(fig)


def figura_croma(croma, sr, caminho):
    fig, ax = plt.subplots(figsize=(14, 4.5))
    librosa.display.specshow(croma, sr=sr, hop_length=SALTO, x_axis="time", ax=ax, cmap="viridis")
    ax.set_yticks(np.arange(12) + 0.5)
    ax.set_yticklabels(NOMES_PT)
    ax.set_title("Croma: presença de cada uma das 12 classes de altura (sem oitava) ao longo do tempo")
    ax.set_xlabel("tempo (s)")
    fig.tight_layout()
    fig.savefig(caminho, dpi=130)
    plt.close(fig)


# ---------------------------------------------------------------- principal
def main():
    SAIDA.mkdir(exist_ok=True)
    y, sr = librosa.load(AUDIO, sr=None, mono=True)
    duracao = len(y) / sr

    potencia = np.abs(librosa.stft(y, n_fft=N_FFT, hop_length=SALTO)) ** 2
    freqs = librosa.fft_frequencies(sr=sr, n_fft=N_FFT)
    tempos = librosa.frames_to_time(np.arange(potencia.shape[1]), sr=sr, hop_length=SALTO)
    croma = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=SALTO)
    tempos_croma = librosa.frames_to_time(np.arange(croma.shape[1]), sr=sr, hop_length=SALTO)
    andamento = float(np.atleast_1d(librosa.beat.beat_track(y=y, sr=sr)[0])[0])
    onsets = librosa.onset.onset_detect(y=y, sr=sr, units="time")

    trechos = []
    contagem_notas = {}
    graves_max = []
    for inicio in np.arange(0, duracao, TRECHO_S):
        fim = min(inicio + TRECHO_S, duracao)
        if fim - inicio < 0.5:
            break
        sel = (tempos >= inicio) & (tempos < fim)
        media = potencia[:, sel].mean(axis=1)
        picos = picos_do_trecho(media, freqs)
        for p in picos:
            if p["harmonico_de"] is None:
                pt = nome_da_frequencia(p["hz"])[0]
                contagem_notas[pt] = contagem_notas.get(pt, 0) + 1
        graves = [p for p in picos if FAIXA_GRAVE[0] <= p["hz"] <= FAIXA_GRAVE[1]]
        nota_grave = min(graves, key=lambda p: p["hz"]) if graves else None
        croma_trecho = croma[:, (tempos_croma >= inicio) & (tempos_croma < fim)].mean(axis=1)
        ordem = np.argsort(croma_trecho)[::-1][:3]
        centroide = float((freqs * media).sum() / (media.sum() + 1e-12))
        e_grave = energia_da_faixa_db(media, freqs, FAIXA_GRAVE)
        e_agudo = energia_da_faixa_db(media, freqs, FAIXA_MEDIO_AGUDA)
        graves_max.append(e_grave)
        trechos.append({
            "inicio": inicio, "fim": fim, "picos": picos, "nota_grave": nota_grave,
            "classes": [NOMES_PT[i] for i in ordem], "acorde": acorde_provavel(croma_trecho),
            "centroide": centroide, "e_grave": e_grave, "e_agudo": e_agudo,
            "ataques": int(((onsets >= inicio) & (onsets < fim)).sum()),
        })

    tonalidades = tonalidade_provavel(croma.mean(axis=1))
    todos_picos = [p for t in trechos for p in t["picos"] if p["harmonico_de"] is None]
    mais_grave = min(todos_picos, key=lambda p: p["hz"])
    mais_agudo = max(todos_picos, key=lambda p: p["hz"])
    ref_db = max(max(t["e_grave"], t["e_agudo"]) for t in trechos)

    figura_espectro(y, sr, SAIDA / "espectrograma.png")
    figura_croma(croma, sr, SAIDA / "croma.png")

    L = []
    L.append("# Leitura do áudio do protótipo")
    L.append("")
    L.append(f"Gerado em {datetime.now():%d/%m/%Y %H:%M} por `leitura-audio/ler_audio.py`. "
             f"Arquivo: `protótipo_v1/audio-prototipo/audio-prototipo.mp3`, {formatar_hz(duracao)} s, {sr} Hz, lido em mono.")
    L.append("")
    L.append("## Como ler este relatório")
    L.append("")
    L.append("- As notas seguem a notação científica: Dó4 é o dó central e Lá4 tem 440 Hz. Em parte da tradição "
             "brasileira o dó central é chamado Dó3; por isso cada nota vem acompanhada da frequência em Hz, que não tem ambiguidade.")
    L.append("- \"c\" são cents: centésimos de semitom. +20 c quer dizer um pouco acima da nota; ±50 c fica no meio de duas notas. "
             "Nos graves os cents são imprecisos: perto de 55 Hz, 1 Hz de erro já vale ~30 c. Ali, confie no nome da nota, não no desvio.")
    L.append("- Um pico é uma frequência que se destaca no espectro médio do trecho. Pico não é nota tocada: pode ser a fundamental "
             "de uma nota ou o harmônico de outra. Quando a frequência é múltiplo de um pico mais grave, a tabela avisa.")
    L.append("- O croma soma as oitavas: mostra quais das 12 notas estão presentes, sem dizer se são graves ou agudas.")
    L.append("- \"Acorde provável\" é a tríade maior ou menor mais parecida com o croma do trecho. Semelhança abaixo de ~0,75 indica "
             "que o trecho não se parece bem com nenhuma tríade simples.")
    L.append("- Instrumentos não são identificados: a mesma faixa de frequência é compartilhada por muitos instrumentos.")
    L.append("")
    L.append("## Resumo do trecho inteiro")
    L.append("")
    L.append("| Medida | Resultado |")
    L.append("|---|---|")
    L.append(f"| Tonalidade provável | {tonalidades[0][1]} (correlação {decimal(tonalidades[0][0])}); depois {tonalidades[1][1]} ({decimal(tonalidades[1][0])}) e {tonalidades[2][1]} ({decimal(tonalidades[2][0])}) |")
    L.append(f"| Andamento estimado | {andamento:.0f} BPM (pode estar dobrado ou pela metade) |")
    L.append(f"| Ataques detectados | {len(onsets)} ({decimal(len(onsets) / duracao, 1)} por segundo) |")
    L.append(f"| Pico mais grave (não harmônico) | {formatar_hz(mais_grave['hz'])} Hz = {formatar_nota(mais_grave['hz'])} |")
    L.append(f"| Pico mais agudo (não harmônico) | {formatar_hz(mais_agudo['hz'])} Hz = {formatar_nota(mais_agudo['hz'])} |")
    frequentes = sorted(contagem_notas.items(), key=lambda kv: -kv[1])[:8]
    L.append(f"| Notas que mais aparecem como pico | {', '.join(f'{n} ({c} trechos)' for n, c in frequentes)} |")
    L.append("")
    L.append("## Trecho a trecho")
    L.append("")
    L.append(f"Trechos de {formatar_hz(TRECHO_S)} s. Energia em dB relativa ao trecho mais forte (0 dB = mais forte). "
             "Faixas do fluxo simétrico: graves 30–220 Hz, médios-agudos 350–6.000 Hz.")
    L.append("")
    L.append("| Tempo | Nota mais grave com destaque | Classes mais presentes | Acorde provável | Centroide | Graves | Médios-agudos | Ataques |")
    L.append("|---|---|---|---|---|---|---|---|")
    for t in trechos:
        grave = f"{formatar_hz(t['nota_grave']['hz'])} Hz = {formatar_nota(t['nota_grave']['hz'])}" if t["nota_grave"] else "nenhum pico entre 30 e 220 Hz"
        L.append(f"| {formatar_hz(t['inicio'])}–{formatar_hz(t['fim'])} s | {grave} | {', '.join(t['classes'])} | "
                 f"{t['acorde'][0]} ({decimal(t['acorde'][1])}) | {formatar_hz(t['centroide'])} Hz | "
                 f"{t['e_grave'] - ref_db:+.0f} dB | {t['e_agudo'] - ref_db:+.0f} dB | {t['ataques']} |")
    L.append("")
    L.append("## Picos de cada trecho")
    L.append("")
    L.append("Até 8 picos por trecho, do mais forte ao mais fraco. \"Relativo\" compara com o pico mais forte do mesmo trecho.")
    for t in trechos:
        L.append("")
        L.append(f"### {formatar_hz(t['inicio'])}–{formatar_hz(t['fim'])} s")
        L.append("")
        L.append("| Frequência | Nota mais próxima | Relativo | Observação |")
        L.append("|---|---|---|---|")
        for p in t["picos"]:
            obs = ""
            if p["harmonico_de"]:
                base, n = p["harmonico_de"]
                obs = f"pode ser o {n}º harmônico de {formatar_hz(base)} Hz ({nome_da_frequencia(base)[0]})"
            L.append(f"| {formatar_hz(p['hz'])} Hz | {formatar_nota(p['hz'])} | {p['relativo_db']:+.0f} dB | {obs} |")
    L.append("")
    L.append("## Figuras")
    L.append("")
    L.append("![Espectrograma](espectrograma.png)")
    L.append("")
    L.append("![Croma](croma.png)")
    L.append("")
    L.append("## Limites")
    L.append("")
    L.append("- A gravação é uma mistura: a análise do protótipo aceitou a frequência fundamental em só 0,089 % dos quadros. "
             "Por isso aqui se fala em picos e notas prováveis, não em notas tocadas.")
    L.append("- Média de 2 s junta notas que mudam dentro do trecho.")
    L.append("- MP3 a 320 kbps altera pouco as frequências abaixo de ~16 kHz, que são as usadas aqui.")
    L.append("- Tonalidade, acorde e andamento vêm de métodos gerais (perfis de Krumhansl e Kessler, moldes de tríades, "
             "rastreador de batidas do librosa) e erram em música modal, atonal ou com acordes estendidos.")
    L.append("- Instrumentos exigem escuta ou um modelo treinado; os números só dizem em que região do espectro há energia.")
    (SAIDA / "leitura-audio-prototipo.md").write_text("\n".join(L), encoding="utf-8")
    print(f"ok: {len(trechos)} trechos; tonalidade {tonalidades[0][1]}; andamento {andamento:.0f} BPM")


if __name__ == "__main__":
    main()
