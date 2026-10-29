"""
Monta as páginas do site a partir dos blocos em sections.html.
Uso (dentro da pasta brio-site):   python _src/build.py
Edite os textos em _src/sections.html e rode de novo. Não edite os .html gerados à mão
(ou edite, mas saiba que o próximo build sobrescreve).
"""
import re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = (ROOT / '_src' / 'sections.html').read_text(encoding='utf-8')
BLOCKS = {m.group(1): m.group(2).strip() for m in re.finditer(r'<!-- @section ([\w-]+) -->\n(.*?)(?=\n<!-- @section |\Z)', SRC, re.S)}

HEAD = """<!doctype html>
<html lang="pt-BR" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#140904">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="https://brio-studio-scroll.vercel.app/assets/brand/og-brio.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{R}assets/brand/brio-logo-claro.webp">
<link rel="preload" href="{R}assets/fonts/bricolage-grotesque-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{R}css/style.css">
<script>
  // conteúdo animado começa escondido só com JS; se nada rodar em 4s, mostra tudo parado
  document.documentElement.classList.replace('no-js', 'js');
  if (sessionStorage.getItem('brio-curtain')) document.documentElement.classList.add('via-curtain');
  setTimeout(() => {{ if (!document.documentElement.classList.contains('motion')) document.documentElement.classList.add('still'); }}, 4000);
</script>
</head>
<body data-page="{page}">
"""
FOOT = """
<script src="{R}js/vendor/gsap.min.js"></script>
<script src="{R}js/vendor/ScrollTrigger.min.js"></script>
<script src="{R}js/vendor/SplitText.min.js"></script>
<script src="{R}js/vendor/CustomEase.min.js"></script>
<script src="{R}js/vendor/lenis.min.js"></script>
<script src="{R}js/main.js"></script>
</body>
</html>
"""
BACK = '<a class="back-chip" href="../index.html#cases" data-nav data-color="#140904" data-name="brio">← todos os cases</a>'

NEXT = {
    'mostarda': dict(NEXT_BG='#E3AE2F', NEXT_FG='#220D08', NEXT_NAME='mostarda', NEXT_HREF='mostarda.html', NEXT_N='02', NEXT_TAGS='pizzaria · identidade visual e mascote'),
    'duda':     dict(NEXT_BG='#6F1B27', NEXT_FG='#EDD4C4', NEXT_NAME='duda borgue', NEXT_HREF='duda-borgue.html', NEXT_N='03', NEXT_TAGS='moda · identidade visual e social media'),
    'globar':   dict(NEXT_BG='#FF7817', NEXT_FG='#140904', NEXT_NAME='globar', NEXT_HREF='globar.html', NEXT_N='01', NEXT_TAGS='restaurante · fotografia, reels e social media'),
}

PAGES = [
    # arquivo, página, título, blocos, próximo case
    ('index.html', 'home', 'Brio Studio · foto, vídeo, design e estratégia | Rio de Janeiro',
     ['opening', 'manifesto', 'servicos', 'resultado', 'cases', 'bands', 'contato'], None),
    ('tudo-junto.html', 'tudo', 'Brio Studio · versão com os cases na mesma página',
     ['opening', 'manifesto', 'servicos', 'resultado', 'globar-open', 'globar', 'reels', 'mostarda', 'mostarda-app',
      'duda-open', 'duda-brand', 'duda-posts', 'bands', 'contato'], None),
    ('cases/globar.html', 'case', 'Globar Restaurante · case Brio Studio',
     ['globar-open', 'globar', 'reels', 'globar-feed', 'next'], 'mostarda'),
    ('cases/mostarda.html', 'case', 'Mostarda Pizza · case Brio Studio',
     ['mostarda', 'mostarda-app', 'next'], 'duda'),
    ('cases/duda-borgue.html', 'case', 'Duda Borgue · case Brio Studio',
     ['duda-open', 'duda-brand', 'duda-posts', 'next'], 'globar'),
]
DESC = 'Brio é a força que impulsiona marcas a se destacarem. Foto, vídeo, design, estratégia e sites no Rio de Janeiro.'

def fill(text, vars):
    return re.sub(r'\{\{(\w+)\}\}', lambda m: vars.get(m.group(1), m.group(0)), text)

for out, page, title, blocks, nxt in PAGES:
    R = '../' if '/' in out else ''
    first = re.search(r'data-label="([^"]+)"', BLOCKS[blocks[0]]).group(1)
    vars = dict(R=R, BACK=BACK if page == 'case' else '', FIRST_LABEL=first, **(NEXT[nxt] if nxt else {}))
    body = '\n\n'.join(fill(BLOCKS[b], vars) for b in blocks)
    html = HEAD.format(title=title, desc=DESC, R=R, page=page) + fill(BLOCKS['ui'], vars) + '\n\n<main id="top">\n\n' + body + '\n\n</main>\n' + FOOT.format(R=R)
    p = ROOT / out
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(html, encoding='utf-8')
    print('ok', out, len(html))
