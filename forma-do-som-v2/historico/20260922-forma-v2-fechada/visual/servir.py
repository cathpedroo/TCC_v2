"""Prévia local do protótipo v2. Serve só os arquivos do protótipo, com busca no MP3."""
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit
import argparse, mimetypes, re

VISUAL = Path(__file__).resolve().parent
RAIZ = VISUAL.parent

ROTAS = {'/' + n: VISUAL / n for n in
         ['index.html', 'estilo.css', 'config.js', 'leitura.js',
          'leitura-worklet.js', 'painel.js', 'pagina.js',
          'pre-analise.js', 'forma.js', 'ver-gravacao.html']}
# rota temporária, só para inspecionar a gravação de tela da autora
_grav = next((p for p in RAIZ.glob('*.mov')), None)
if _grav:
    ROTAS['/gravacao.mov'] = _grav
ROTAS['/'] = VISUAL / 'index.html'
ROTAS['/../audio/audio-prototipo.mp3'] = RAIZ / 'audio/audio-prototipo.mp3'
ROTAS['/audio/audio-prototipo.mp3'] = RAIZ / 'audio/audio-prototipo.mp3'


class Handler(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def caminho(self):
        return ROTAS.get(urlsplit(self.path).path)

    def do_GET(self, corpo=True):
        alvo = self.caminho()
        if alvo is None or not alvo.is_file():
            self.send_error(404, 'Recurso fora do protótipo')
            return
        dados = alvo.read_bytes()
        tipo = mimetypes.guess_type(alvo.name)[0] or 'application/octet-stream'
        inicio, fim = 0, len(dados) - 1
        faixa = self.headers.get('Range')
        parcial = False
        if faixa and (m := re.fullmatch(r'bytes=(\d*)-(\d*)', faixa.strip())):
            a, b = m.groups()
            if a:
                inicio, parcial = int(a), True
                if b:
                    fim = min(int(b), fim)
            elif b:
                inicio, parcial = max(0, len(dados) - int(b)), True
        trecho = dados[inicio:fim + 1]
        self.send_response(206 if parcial else 200)
        self.send_header('Content-Type', tipo)
        self.send_header('Content-Length', str(len(trecho)))
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Cache-Control', 'no-store')
        if parcial:
            self.send_header('Content-Range', f'bytes {inicio}-{fim}/{len(dados)}')
        self.end_headers()
        if corpo:
            self.wfile.write(trecho)

    def do_HEAD(self):
        self.do_GET(corpo=False)

    def do_POST(self):
        # Guarda o quadro do instante atual. É assim que saem as figuras da
        # monografia: o modo arquivo é determinístico, então o mesmo segundo
        # dá sempre a mesma imagem (PRD, seção 3).
        if urlsplit(self.path).path != '/figura':
            self.send_error(404)
            return
        nome = self.headers.get('X-Nome', 'quadro')
        nome = re.sub(r'[^A-Za-z0-9_.-]', '-', nome)[:80] or 'quadro'
        dados = self.rfile.read(int(self.headers.get('Content-Length', 0)))
        destino = RAIZ / 'figuras'
        destino.mkdir(exist_ok=True)
        (destino / (nome + '.png')).write_bytes(dados)
        self.send_response(200)
        self.send_header('Content-Length', '2')
        self.end_headers()
        self.wfile.write(b'ok')

    def log_message(self, *a):
        pass


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--porta', type=int, default=8675)
    porta = p.parse_args().porta
    print(f'Protótipo v2 em http://localhost:{porta}/  (Ctrl+C para parar)')
    ThreadingHTTPServer(('127.0.0.1', porta), Handler).serve_forever()
