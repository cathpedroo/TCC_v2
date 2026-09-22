# A forma do som — protótipo v2

Protótipo de visualizador de som instrumental para o TCC, baseado em
correspondências crossmodais medidas na bibliografia (som pontudo × som redondo,
brilho × angularidade). Duas formas na tela, cada uma ouvindo uma faixa de
frequência do mesmo áudio:

- a **forma média-aguda** (350–6.000 Hz) responde à leitura sustentada — brilho,
  energia, picos;
- a **forma grave** (30–220 Hz) responde aos ataques.

As duas são independentes por medida, e é isso que justifica serem duas: no áudio
de teste, a correlação entre o ataque grave e o brilho médio-agudo é −0,08.

## Estado

A **forma está fechada** desde 22/09/2026 (PRD versão 6.0). O passo seguinte é a
cor. O estado congelado do fechamento, que roda sozinho, está em
`historico/20260922-forma-v2-fechada/`.

## Como abrir

```
cd visual
python3 servir.py
```

Depois, `http://localhost:8675/`. Escolha um arquivo de áudio ou clique em
"Usar o áudio do protótipo". A página lê a faixa **inteira** antes de desenhar,
numa passagem prévia que roda o mesmo motor de análise mais rápido que o tempo
real, e se calibra sozinha naquele material.

Não precisa instalar nada além do Python que já vem no macOS. Toda a análise
acontece no navegador, num AudioWorklet com FFT própria.

## Onde está o quê

| pasta | o que é |
|---|---|
| `visual/` | o protótipo: análise, geometria, página |
| `visual/VERIFICACAO-LEITURA.md` | o que foi conferido, com que números, e os erros encontrados no caminho |
| `insumos/PRD-protótipo v2.md` | a especificação inteira, com o anexo do que cada fonte da bibliografia diz |
| `insumos/pares-verificacao/` | pares de instantes do áudio para conferir a régua |
| `insumos/onde-esta-o-gritinho/` | os arquivos de escuta de um achado negativo (ver abaixo) |
| `historico/` | versões congeladas, uma por decisão fechada |
| `figuras/` | só a comparação citada na verificação; as demais ficaram de fora (ver abaixo) |

## Um achado que vale ler

Em `insumos/PRD-protótipo v2.md`, seção 6, está registrado um **limite
demonstrado**: um evento que a autora isola de ouvido na mistura e que nenhum
descritor da tabela de mapeamento captura. Quatro famílias de medida falharam;
só o casamento de molde espectral encontrou, e isso está fora do enquadramento
do projeto. O achado negativo é resultado, não fracasso.

## O que não está neste repositório

- As **faixas separadas** em `insumos/leitura-audio/saida/faixas/*.wav` (15 MB).
  Refazer com `separar_faixas.py`, que está na mesma pasta.
- As **gravações de tela** (`.mov`), que eram material de trabalho.
- A maior parte das **figuras** (142 de 143 PNG, 9 MB). Eram quadros de
  comparação gerados durante o desenho da forma — variantes de ponta, de eixo x,
  de sobreposição — e nenhum documento aqui aponta para eles, tirando a
  comparação que ficou. Os quadros novos saem da própria página, no botão
  "Salvar este quadro": o modo arquivo é determinístico, então o mesmo segundo
  dá sempre a mesma imagem.
