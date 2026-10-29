# PLAYBOOK — como fazer sites com animação de scroll

Tudo aqui foi tirado do código do site de referência (conexao-criativa.vercel.app, páginas /thalles, /renan, /lorrian)
e testado no site da Brio (`brio-site/js/main.js`). Use como receita.

---
## 1. A ideia central: seção alta + palco grudado + timeline no scroll

```html
<section class="scene" id="manifesto" style="--len:250">   <!-- 250vh de altura -->
  <div class="stage"> ...conteúdo... </div>                 <!-- 100svh, sticky -->
</section>
```
```css
.scene{position:relative;height:calc(var(--len) * 1vh)}
.stage{position:sticky;top:0;height:100svh;overflow:hidden}
```
Enquanto você rola os 250vh da seção, o palco fica parado na tela. Os 150vh "sobrando" viram o tempo da animação.
Mais `--len` = animação mais longa/lenta. Na referência: 160–440vh por cena.

```js
const scene = (id, len = 1) => {
  const el = document.getElementById(id);
  const tl = gsap.timeline({ defaults:{ease:'none'}, scrollTrigger:{
    trigger: el, start:'top top', end:'bottom bottom', scrub:.6, invalidateOnRefresh:true }});
  tl.set({}, {}, len);      // fixa o tamanho da timeline: posições 0..len viram "capítulos"
  return { el, tl };
};
```
- `scrub: .6` = a animação segue o scroll com 0,6s de suavização (o "mola" gostoso). `scrub:true` = colado no scroll.
- `invalidateOnRefresh` + valores em função (`y: () => innerHeight`) = recalcula quando a tela muda de tamanho.
- Pense em capítulos: `tl.to(a, {...}, 0)`, `tl.to(b, {...}, 1.2)` — o número é *onde* no scroll acontece.

## 2. Helper que evita "piscar"
```js
const ft = (tl, t, from, to, pos) => { gsap.set(t, from); return tl.fromTo(t, from, to, pos); };
```
Aplica o estado inicial já na carga (a referência chama de `g`).

## 3. Eases da referência (definem a "personalidade")
```js
CustomEase.create('pop',   '.34,1.56,.64,1');  // passa do ponto e volta: stickers, logos, botões
CustomEase.create('out',   '.23,1,.32,1');     // chegada suave: textos, cards
CustomEase.create('inout', '.77,0,.175,1');    // dramático: máscaras, troca de cena
```
Dentro de timeline com scrub, use `ease:'none'` no geral e easings só em peças específicas.

## 4. Catálogo de efeitos (com onde está no site da Brio)
| Efeito | Como | Onde |
|---|---|---|
| Palavras acendem | `SplitText(el,{type:'words'})` + `opacity .12→1` com stagger | manifesto |
| Letras sobem com máscara | `SplitText(el,{type:'chars', mask:'chars'})` + `yPercent:115→0` | "prazer, sou a Clara" |
| Foto abre de pílula pra tela cheia | `clipPath:'inset(32% 26% 32% 26% round 999px)'` → `inset(0% 0% 0% 0% round 0px)` + imagem `scale 1.3→1` | abertura, mostarda aplicação |
| Cortina antes/depois | `clipPath:'inset(0 100% 0 0)'` → `inset(0 0% 0 0)` + alça `left 0→100%` | serviços |
| Cards caem e empilham | `y:-120vh, rotation aleatória` → `y≈0, rotation ±9` em sequência | case Globar (vem do /renan) |
| Trilho horizontal | `gsap.to(track,{x:()=>-(track.scrollWidth-innerWidth)})` com scrub | serviços |
| Animação dentro do trilho | `scrollTrigger:{ containerAnimation: h, trigger: painel, start:'left 90%' }` | serviços |
| Números contando | tween de objeto `{v:0}` → `{v:2442}` com `onUpdate` | feed, arquivo MB |
| Linha que se desenha | `<path pathLength="1">` + `stroke-dasharray:1` + `strokeDashoffset 1→0` | sublinhado final |
| Squash & stretch | `keyframes:{scaleX:[1,1.2,.9,1], scaleY:[1,.8,1.1,1]}` | grãozinho, boca da Duda |
| Balanço | `keyframes:{rotation:[0,7,-5,3,0]}` | sacola, logo |
| Estados discretos (troca de rosto/rótulo) | `watch(tl, t => ...)` lendo `tl.time()` a cada update | grãozinho |
| Texto "slot machine" | itens empilhados (grid 1/1), o atual sai `yPercent:-110`, o novo entra de `110` | rótulos |
| Cena cobre a anterior | palco anterior: `y:+50vh, scale:.94, --dim:.55` enquanto a próxima entra | todas |
| Fotos voam pros lados | `xPercent: lado*200`, decide lado pela posição do card | abertura (vem do /thalles) |
| Parallax no mouse | `gsap.quickTo(el,'x')` com profundidade por card | abertura |
| Fundo muda de cor por estado | `tl.to(stage,{backgroundColor})` em cada capítulo | Mostarda |
| Recolorir PNG com CSS | `background:cor; mask:url(logo.webp)` | padrão de bocas da Duda |
| Loader timecode | contador 0→100 + `HH:MM:SS:FF` (30fps) + flicker | loader (vem do /lorrian) |

## 5. Regras que fazem parecer profissional
1. **Um conceito por cena.** Cada cena conta uma ideia (o arquivo pesado, a edição, o grão que tem humor).
2. **Animação conta a história do cliente**, não é enfeite: no Globar a comida "cai na mesa"; na Mostarda o mascote "sai pra entrega".
3. **Propriedades separadas pra intro e pro scroll** — se a intro (por tempo) e o scroll mexem no mesmo `scale`, quebra. Use wrapper (h1 = scroll, img = intro).
4. **Só anime transform, opacity, clip-path e filter.** Nunca width/top/left em coisas grandes.
5. **Mobile não é desktop menor**: reposicione (media query), esconda elementos, simplifique painéis.
6. **Reduzir movimento**: `matchMedia('(prefers-reduced-motion: reduce)')` → classe `.reduce` com tudo visível e cenas em altura normal. E um fallback de 4s se o JS não rodar.
7. **Peso**: WebP ≤1600px (~100–300KB), vídeo 540p H.264 mudo `playsinline loop`, `preload="none"` + IntersectionObserver pra tocar só quando aparece. Pré-carregar imagens da próxima cena.
8. **Lenis** pra rolagem macia: `lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t=>lenis.raf(t*1000))`.
9. Teste com screenshots em vários pontos do scroll (Playwright) no desktop (1440×900) e no celular (390×844).

## 5b. Erros que já cometemos (não repetir)
- **CSS `transition` em `transform` + GSAP no mesmo elemento = trava.** Os nomes dos cases ficaram presos fora da tela por isso. Pra hover, use a propriedade separada `translate`/`rotate`/`scale` no CSS e deixe `transform` só pro GSAP.
- **Imagem pequena em tela cheia fica borrada.** Foto que vira tela cheia precisa de ≥2400px no lado maior; use `<picture>` com versão horizontal (desktop) e vertical (celular).
- **Texto por cima de foto** precisa de escurecimento (`::after` com gradiente) ou a foto só aparece depois do texto sair.
- **Print/foto com fundo branco** em cima de fundo colorido parece amador: recorte (Python + scipy: remove a cor do fundo conectada às bordas) ou coloque num "card" com sombra.
- **Antes/depois**: convenção é antes à esquerda, depois à direita.
- Toda seção precisa de `data-label` pro HUD.

## 6. Site com várias páginas (versão B)
- **Mesma base, várias páginas**: um `main.js` só; cada cena em `if (has('id')) { ... }` → a página só roda o que tem.
- **Blocos + build**: `_src/sections.html` tem os blocos (`<!-- @section nome -->`); `_src/build.py` monta as páginas (lista `PAGES`). `{{R}}` = prefixo de caminho (`../` dentro de `cases/`). Bom pra reaproveitar cenas entre versões e entre clientes.
- **Entrada por tempo x por scroll**: a primeira cena de cada página tem animação de entrada que toca depois do loader/cortina (`enter(el, build)`); se a cena não é a primeira, a mesma entrada toca quando ela chega na tela. Animações por scroll ficam na timeline com scrub. Nunca as duas no mesmo par elemento+propriedade.
- **Transição entre páginas (cortina)**: clique em `a[data-nav]` → círculo na cor da marca cresce do ponto do clique (`clip-path: circle()`), mostra o nome do destino → `sessionStorage` guarda a cor → nova página nasce coberta (classe `via-curtain` no `<head>`, antes de pintar) e a cortina sobe. Volta do navegador: `pageshow` com `persisted` esconde a cortina.
- **Linha que enche de cor do ponto onde o mouse entrou**: no `pointerenter/leave` grava `--x/--y` (%), e o `::before` faz `clip-path: circle(0% at var(--x) var(--y))` → `circle(150% ...)` com transition. (Igual aos nomes dos palestrantes na referência.)
- **Prévia seguindo o cursor**: `<img>` fixa + `gsap.quickTo` em x/y; troca o `src` no hover de cada linha.
- **Voltar pra âncora** (`index.html#cases`): depois do `ScrollTrigger.refresh()`, `lenis.scrollTo(hash, {immediate:true, force:true})`.

## 7. Como a referência é organizada (Astro)
- Cada palestrante = uma página com 6–8 cenas (`data-scene="opening"`, `"problem"`...), cada uma com `--len`.
- Um arquivo `motion.js` compartilhado: eases, registro de cena (`pa(selector, fn)`) com `gsap.matchMedia` pra reduzir movimento, e um IntersectionObserver que troca `loading=lazy` → `eager` na cena seguinte.
- Cada página tem um script próprio com as timelines. Barra de progresso no topo com `scaleX` scrub.

## 8. Checklist de um novo site pra cliente
1. Coletar: logo (PNG transparente), cores (hex), fontes, 10–20 fotos boas, 2–4 vídeos curtos, frases/tom de voz, 2–3 cases.
2. Roteiro: 6–10 cenas, uma ideia por cena, escrever o texto antes de animar.
3. Otimizar assets (script Python/ffmpeg usado na v2: WebP q78, vídeo crf 27 540p).
4. Montar HTML das cenas → CSS do layout final (estado "parado") → animar cena por cena.
5. Screenshots desktop + mobile, corrigir sobreposições.
6. Deploy na Vercel.
7. Decidir com o cliente: tudo numa página (história contínua) ou home + páginas de case (portfólio). Pra estúdio/agência com vários clientes, páginas separadas costumam ficar mais claras.
