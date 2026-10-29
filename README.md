# Brio Studio — site com animação de scroll

> Projeto de portfólio de **Bruno Codeco** · site para a **Brio Studio** (Clara Borgue), estúdio criativo do Rio de Janeiro.

🔗 **Site no ar:** _(https://brio-studio-scroll.vercel.app/)_

Um site em que **rolar a página conta a história da marca**: as fotos voam, a imagem abre de trás do logo,
os controles de edição se mexem e editam a foto ao vivo, o mascote de um cliente troca de humor e sai pra entrega.
Inspirado no nível de sites de evento/agência feitos com GSAP.

---

## O que tem aqui

| Página | O que acontece |
|---|---|
| `index.html` | Apresentação da Brio: abertura, manifesto, **edição ao vivo**, serviços em trilho horizontal e o seletor **"escolhe um case"** |
| `cases/globar.html` | Restaurante: fotos que caem e empilham na mesa, reels em celulares, feed do Instagram rolando |
| `cases/mostarda.html` | Identidade visual: o logo monta por linhas, o grãozinho passa por 5 humores e "sai pra entrega" |
| `cases/duda-borgue.html` | Moda: a boca do logo "beija" e a câmera entra nela, padrão, sacola e posts em leque |
| `tudo-junto.html` | Versão alternativa com tudo numa página só |

Entre páginas, uma **cortina na cor da marca** cresce do ponto do clique e abre a página seguinte.

## Como funciona (resumo)

Cada cena é uma **seção alta** (ex.: 250% da tela) com um **palco grudado** (`position: sticky`) do tamanho da tela.
Enquanto a pessoa rola a seção, o palco fica parado e uma **timeline do GSAP presa ao scroll** (ScrollTrigger com `scrub`) anima o que está dentro dele.

```css
.scene { height: calc(var(--len) * 1vh); }          /* ex.: --len: 250 */
.stage { position: sticky; top: 0; height: 100svh; }
```
```js
const tl = gsap.timeline({ scrollTrigger: { trigger: secao, start: 'top top', end: 'bottom bottom', scrub: .6 } });
tl.to(foto, { clipPath: 'inset(0% 0% 0% 0%)' }, 0)   // a foto abre
  .to(logo, { scale: .6 }, .15);                       // o logo diminui
```

Técnicas usadas: texto quebrado em palavras/letras (SplitText), máscaras com `clip-path`, trilho horizontal com
`containerAnimation`, contadores, linhas SVG que se desenham, squash & stretch, troca de estados por scroll,
cortina entre páginas, parallax com o mouse, rolagem macia (Lenis) e versão sem animação pra quem prefere menos movimento.
Explicação completa em [`docs/PLAYBOOK-ANIMACOES.md`](docs/PLAYBOOK-ANIMACOES.md).

## Tecnologias
HTML + CSS + JavaScript puros (sem framework, sem build obrigatório) ·
[GSAP 3.14](https://gsap.com) (ScrollTrigger, SplitText, CustomEase) · [Lenis](https://lenis.darkroom.engineering) · hospedado na Vercel.

## Estrutura
```
index.html, tudo-junto.html, cases/   ← páginas (geradas)
_src/sections.html                    ← TODO o conteúdo, em blocos (edite aqui)
_src/build.py                         ← junta os blocos e gera as páginas
css/style.css                         ← visual (cores no topo, em :root)
js/main.js                            ← animações, um bloco por cena
js/vendor/                            ← GSAP e Lenis (locais)
assets/                               ← fotos (WebP), vídeos (MP4), logos
docs/PLAYBOOK-ANIMACOES.md            ← o método, explicado
```

## Rodar no computador
```bash
python -m http.server 8000     # dentro desta pasta
# abrir http://localhost:8000
```

## Editar
1. Textos/imagens/ordem das seções: `_src/sections.html`
2. Rodar `python _src/build.py` (gera `index.html`, `tudo-junto.html` e `cases/*.html`)
3. Animações: `js/main.js` · Cores e tamanhos: `css/style.css`
4. Mandar pro GitHub → a Vercel publica sozinha

## Créditos
- Fotografia, design e social media dos cases: **Brio Studio / Clara Borgue** ([@creativebrio](https://instagram.com/creativebrio))
- Clientes: Globar Restaurante, Mostarda Pizza, Duda Borgue
- Desenvolvimento e animação: **Bruno Codeco**

As imagens e marcas pertencem aos seus donos e estão aqui só como portfólio. O código pode servir de estudo.
