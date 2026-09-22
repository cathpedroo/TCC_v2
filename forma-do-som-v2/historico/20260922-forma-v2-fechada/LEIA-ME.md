# A forma do v2, congelada em 22/09/2026

Esta pasta é uma cópia integral do protótipo no estado em que a autora deu a
forma por definida, antes de começar a etapa de cor. Não editar nada aqui: é
registro. O que continua vivo está em `protótipo_v2/visual/`.

## O que tem dentro

- `visual/` — código completo da etapa 1, exatamente como estava no fechamento
- `PRD-protótipo v2 — versão 6.0.md` — o documento no mesmo instante

## Como rodar esta cópia

```
cd historico/20260922-forma-v2-fechada/visual
python3 servir.py --porta 8676
```

Depois, `http://localhost:8676/`. A porta é outra de propósito, para poder
comparar lado a lado com a versão viva em 8675.

## Os números do fechamento

Medidos no áudio de teste, 855 quadros acima do piso de silêncio:

| | |
|---|---|
| correlação energia grave × brilho médio-agudo | −0,537 (contra −0,53 medidos em Python em 18/09) |
| correlação entre as duas angularidades | 0,178 |
| cruzamentos de angularidade | 0 |
| menor distância entre as duas | +0,121 |
| grave acima do próprio teto (0,32) | 13,9%, máximo 0,454 |
| média-aguda acima do próprio teto (0,78) | 16,6%, máximo 1,048 |
| excursão da angularidade, percentis 5 a 95 | 0,310 na grave, 0,419 na média-aguda |

## O que NÃO está conferido

Os critérios de aceite 2 a 9 do PRD dependem de sinais sintéticos (tom puro
varrendo, clique seco, ruído de banda larga) ou de gravar som e tela juntos para
medir o atraso físico. Nenhum deles foi feito. A lista está em
`visual/VERIFICACAO-LEITURA.md`, em *O que esta etapa NÃO cobre*.

O modo microfone existe no código e nunca foi exercitado (pendência P5).
