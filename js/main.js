/* =========================================================
   BRIO STUDIO — animações de scroll (um arquivo pra todas as páginas)
   Receita (mesma do conexao-criativa.vercel.app):
   1. cada .scene é uma seção alta (--len em vh) com um .stage sticky de 100svh
   2. cada cena tem UMA timeline GSAP ligada ao scroll (ScrollTrigger + scrub)
   3. a timeline usa "capítulos" (0, 1, 2...) — tl.set({}, {}, len) fixa o tamanho
   4. entradas "por tempo" (intro) ficam separadas das animações "por scroll"
   5. cada bloco só roda se a seção existir na página (if has('id'))
   6. links com data-nav trocam de página com uma cortina na cor da marca
   ========================================================= */
(() => {
  const html = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const has = id => !!document.getElementById(id);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = () => innerWidth < 760;
  const ROOT = location.pathname.includes('/cases/') ? '../' : '';

  /* ---------- conteúdo gerado ---------- */
  const starPts = (n = 12, R = 98, r = 66) => Array.from({ length: n * 2 }, (_, i) => {
    const a = (Math.PI / n) * i - Math.PI / 2, d = i % 2 ? r : R;
    return (Math.cos(a) * d).toFixed(1) + ',' + (Math.sin(a) * d).toFixed(1);
  }).join(' ');
  $$('[data-star]').forEach(p => p.setAttribute('points', starPts()));
  if ($('[data-band]')) {
    const b1 = 'captação <span class="s">★</span> edição <span class="s">★</span> estratégia <span class="s">★</span> ';
    const b2 = 'a força que impulsiona marcas a se destacarem <span class="s">★</span> ';
    $('[data-band="1"]').innerHTML = `<span>${b1.repeat(4)}</span>`;
    $('[data-band="-1"]').innerHTML = `<span>${b2.repeat(3)}</span>`;
  }
  const N = 32, histo = $('[data-histo]');
  const bell = (i, mu, sd, k = 1) => k * Math.exp(-((i - mu) ** 2) / (2 * sd * sd));
  const hRaw = Array.from({ length: N }, (_, i) => Math.max(.04, bell(i, 13, 3.2)));
  const hEd = Array.from({ length: N }, (_, i) => Math.max(.06, Math.min(1, bell(i, 9, 5, .75) + bell(i, 22, 5.5, .9) + .08)));
  if (histo) histo.innerHTML = '<i></i>'.repeat(N);

  /* ---------- vídeos: só tocam quando aparecem ---------- */
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) { if (v.preload === 'none') { v.preload = 'auto'; v.load(); } v.play().catch(() => {}); }
    else v.pause();
  }), { threshold: .2 });
  $$('[data-video]').forEach(v => vio.observe(v));

  /* ---------- cortina entre páginas (chegada) ---------- */
  const curtain = $('[data-curtain]'), cName = $('[data-curtain-name]');
  let via = null;
  try { via = JSON.parse(sessionStorage.getItem('brio-curtain') || 'null'); sessionStorage.removeItem('brio-curtain'); } catch (e) {}
  const isLight = hex => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * .299 + ((n >> 8) & 255) * .587 + (n & 255) * .114) > 150; };
  const paintCurtain = (color, name) => { curtain.style.background = color; curtain.style.color = isLight(color) ? '#220D08' : '#FFF1E4'; cName.textContent = name || ''; };
  if (via) { paintCurtain(via.color, via.name); const l = $('[data-loader]'); if (l) l.style.display = 'none'; }
  addEventListener('pageshow', e => { if (e.persisted) { curtain.style.display = 'none'; curtain.style.clipPath = ''; } });

  if (reduce || !window.gsap || !window.ScrollTrigger) {
    html.classList.add('reduce'); html.classList.remove('via-curtain'); return;
  }
  html.classList.add('motion');

  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create('pop', '.34,1.56,.64,1');   // passa do ponto e volta (quique)
  CustomEase.create('out', '.23,1,.32,1');      // sai rápido, chega devagar
  CustomEase.create('inout', '.77,0,.175,1');   // dramático nos dois lados
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------- rolagem macia ---------- */
  const lenis = new Lenis({ lerp: .11, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();

  /* ---------- helpers ---------- */
  const SCRUB = .6, rnd = gsap.utils.random, lerp = (a, b, t) => a + (b - a) * t;
  const scene = (id, len = 1) => {
    const el = $('#' + id);
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: SCRUB, invalidateOnRefresh: true } });
    tl.set({}, {}, len);
    return { el, tl };
  };
  // fromTo que já aplica o estado inicial (evita "piscar")
  const ft = (tl, t, from, to, pos) => { gsap.set(t, from); return tl.fromTo(t, from, to, pos); };
  const words = el => new SplitText(el, { type: 'words' }).words;
  const watch = (tl, fn) => { const prev = tl.eventCallback('onUpdate'); tl.eventCallback('onUpdate', () => { prev && prev(); fn(tl.time()); }); };
  const roll = el => {
    const items = $$('.roll-item', el); let on = 0;
    gsap.set(items, { y: 0, yPercent: i => (i ? 110 : 0) });
    return i => {
      if (i === on || !items[i]) return;
      const d = i > on ? 1 : -1;
      gsap.to(items[on], { yPercent: -110 * d, duration: .35, ease: 'inout', overwrite: true });
      gsap.fromTo(items[i], { yPercent: 110 * d }, { yPercent: 0, duration: .35, ease: 'inout', overwrite: true });
      on = i;
    };
  };
  const tc = s => { s = Math.max(0, s); const p = n => String(Math.floor(n)).padStart(2, '0'); return `${p(s / 3600)}:${p(s / 60 % 60)}:${p(s % 60)}:${p(s % 1 * 30)}`; };

  // ENTRADA por tempo: se a seção é a primeira da página, toca depois do loader/cortina;
  // se não, toca quando a seção chega na tela (e volta se a pessoa subir).
  const sections = $$('main > section');
  const intros = [];
  const enter = (el, build) => {
    const t = gsap.timeline({ paused: true });
    build(t);
    if (el === sections[0]) intros.push(t);
    else ScrollTrigger.create({ trigger: el, start: 'top 70%', onEnter: () => t.play(), onLeaveBack: () => t.reverse() });
    return t;
  };

  /* ---------- UI global ---------- */
  sections.forEach((s, i) => (s.style.zIndex = i + 1));
  gsap.to('[data-progress]', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });
  const hudTc = $('[data-hud-tc]'), hudLabel = $('[data-hud-label]');
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => { hudTc.textContent = tc(s.progress * 94); } });
  sections.forEach(sec => sec.dataset.label && ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: s => { if (s.isActive) hudLabel.textContent = sec.dataset.label; } }));
  // quando chega no fim da página, o rótulo é o da última seção
  ScrollTrigger.create({ start: () => ScrollTrigger.maxScroll(window) - 4, end: 'max', onToggle: s => { if (s.isActive) hudLabel.textContent = sections.at(-1).dataset.label || ''; } });

  // a cena seguinte "cobre" a anterior
  sections.forEach((sec, i) => {
    if (!i) return;
    const prev = $(':scope > .stage', sections[i - 1]); if (!prev) return;
    gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top top', scrub: true } })
      .to(prev, { y: () => innerHeight * .5, scale: .94, '--dim': .55, ease: 'none' });
  });

  // pré-carrega imagens da próxima cena
  const pre = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; pre.unobserve(e.target);
    const nx = e.target.nextElementSibling; nx && $$('img[loading="lazy"]', nx).forEach(im => (im.loading = 'eager'));
  }));
  sections.forEach(s => pre.observe(s));

  // cursor (só desktop)
  const hover = matchMedia('(hover:hover)').matches;
  let px = 0, py = 0;
  if (hover) {
    const cur = $('[data-cursor]'), txt = $('[data-cursor-text]');
    const qx = gsap.quickTo(cur, 'x', { duration: .35, ease: 'power3' }), qy = gsap.quickTo(cur, 'y', { duration: .35, ease: 'power3' });
    addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; qx(px); qy(py); cur.style.opacity = 1; }, { passive: true });
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('[data-cursor-label], a, .st-card, .ma-pola, .dp-card');
      cur.classList.toggle('big', !!t);
      txt.textContent = t ? (t.dataset.cursorLabel || (t.tagName === 'A' ? '→' : 'olha')) : '';
    });
  }

  /* =========================================================
     ABERTURA — cards voam, a foto abre de trás do logo e vira tela cheia
     ========================================================= */
  if (has('opening')) {
    const { el, tl } = scene('opening', 1);
    const hero = $('[data-hero]', el), heroImg = $('img', hero), cards = $$('[data-card]', el), logo = $('[data-op-logo]', el), logoImg = $('img', logo);
    cards.forEach(c => {
      const side = () => { const r = c.getBoundingClientRect(); return r.left + r.width / 2 < innerWidth / 2 ? -1 : 1; };
      tl.to(c, { xPercent: () => side() * rnd(170, 260), yPercent: () => rnd(-110, -30), rotation: () => side() * rnd(12, 32), duration: .55, ease: 'power2.in' }, 0);
    });
    tl.fromTo(hero, { clipPath: 'inset(50% 50% 50% 50% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: .7, ease: 'inout' }, .04)
      .fromTo(heroImg, { scale: 1.12 }, { scale: 1, duration: .8 }, .04)
      .fromTo(hero, { '--shade': .55 }, { '--shade': .9, duration: .5 }, .3)
      .to($$('.op-head, .op-slogan, .op-hint', el), { autoAlpha: 0, y: -24, duration: .2 }, 0)
      .to(logo, { scale: .6, duration: .6, ease: 'inout' }, .15)
      .fromTo('[data-op-caption]', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .2, ease: 'out' }, .75);
    const qs = cards.map(c => [gsap.quickTo(c, 'x', { duration: 1, ease: 'power3' }), gsap.quickTo(c, 'y', { duration: 1, ease: 'power3' }), +c.dataset.depth]);
    el.addEventListener('pointermove', e => { const dx = e.clientX / innerWidth - .5, dy = e.clientY / innerHeight - .5; qs.forEach(([x, y, d]) => { x(dx * 40 * d); y(dy * 40 * d); }); });
    // entrada (escala/opacidade — propriedades diferentes das do scroll)
    gsap.set(cards, { scale: 0, autoAlpha: 0 }); gsap.set(logoImg, { scale: .3, autoAlpha: 0 });
    enter(el, t => t
      .to(cards, { scale: 1, autoAlpha: 1, duration: .7, ease: 'pop', stagger: { each: .07, from: 'random' } }, .1)
      .to(logoImg, { scale: 1, autoAlpha: 1, duration: .8, ease: 'pop' }, .25)
      .to(logoImg, { keyframes: { rotation: [0, -6, 5, -3, 1, 0] }, duration: .7, ease: 'sine.inOut' }, .8)
      .fromTo($$('[data-in]', el), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: .6, stagger: .08, ease: 'out' }, .65));
  }

  /* ---------- MANIFESTO ---------- */
  if (has('manifesto')) {
    const { el, tl } = scene('manifesto', 3);
    const a = words($('[data-mf-a]', el)), b = words($('[data-mf-b]', el));
    const file = $('[data-mf-file]', el), size = $('[data-mf-size]', el), mb = { v: 0 };
    ft(tl, a, { opacity: .12 }, { opacity: 1, stagger: .12, duration: .1 }, .05);
    ft(tl, b, { opacity: .12 }, { opacity: 1, stagger: .08, duration: .1 }, 1.05);
    ft(tl, file, { autoAlpha: 0, scale: .4, rotation: -14 }, { autoAlpha: 1, scale: 1, rotation: 3, duration: .3, ease: 'pop' }, 1.3);
    tl.to(mb, { v: 486, duration: 1, onUpdate: () => { size.textContent = Math.round(mb.v) + ' MB'; } }, 1.4)
      .to(file, { rotation: -9, scaleY: .9, duration: .3, ease: 'sine.inOut' }, 2.3)
      .to(file, { y: () => innerHeight * .9, rotation: 32, duration: .45, ease: 'power2.in' }, 2.6)
      .fromTo('[data-mf-star]', { rotation: 0 }, { rotation: 140, duration: 3 }, 0);
  }

  /* ---------- EDIÇÃO AO VIVO ---------- */
  if (has('edicao')) {
    const { el, tl } = scene('edicao', 4);
    const img = $('[data-ed-img]', el), bars = $$('i', histo);
    const st = { exp: 0, con: 0, sat: 0, tmp: 0, rot: 0 };
    const sliders = $$('[data-sl]', el).map(s => ({ k: s.dataset.sl, from: +s.dataset.from, to: +s.dataset.to, fix: +s.dataset.fix, unit: s.dataset.unit || '', b: $('b', s), knob: $('.knob', s), fill: $('.fill', s) }));
    const apply = () => {
      img.style.filter = `brightness(${lerp(.62, 1.03, st.exp)}) contrast(${lerp(.72, 1.08, st.con)}) saturate(${lerp(.3, 1.18, st.sat)}) sepia(${lerp(0, .1, st.tmp)}) hue-rotate(${lerp(-16, 0, st.tmp)}deg)`;
      img.style.transform = `rotate(${lerp(-5, 0, st.rot)}deg) scale(${lerp(1.13, 1, st.rot)})`;
      sliders.forEach(s => {
        const p = st[s.k], pos = s.k === 'rot' ? lerp(.25, .5, p) : lerp(.18, .74, p);
        s.b.textContent = lerp(s.from, s.to, p).toFixed(s.fix) + s.unit;
        s.knob.style.left = pos * 100 + '%'; s.fill.style.transform = `scaleX(${pos})`;
      });
    };
    apply();
    ft(tl, words($('[data-ed-title]', el)), { yPercent: 80, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: .06, duration: .25, ease: 'out' }, 0);
    ft(tl, '[data-ed-panel]', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .25, ease: 'out' }, .1);
    ft(tl, '[data-ed-photo]', { autoAlpha: 0, scale: .9 }, { autoAlpha: 1, scale: 1, duration: .3, ease: 'out' }, .05);
    tl.to(st, { exp: 1, duration: .6, ease: 'inout' }, .4).to(st, { con: 1, duration: .6, ease: 'inout' }, 1.0)
      .to(st, { sat: 1, duration: .6, ease: 'inout' }, 1.6).to(st, { tmp: 1, duration: .5, ease: 'inout' }, 2.2)
      .to(st, { rot: 1, duration: .5, ease: 'inout' }, 2.7);
    ft(tl, bars, { scaleY: i => hRaw[i] }, { scaleY: i => hEd[i], duration: 2.6, ease: 'inout' }, .4);
    tl.to('[data-ed-grid]', { autoAlpha: 0, duration: .2 }, 3.2);
    ft(tl, '[data-ed-stamp]', { autoAlpha: 0, scale: 2.6, rotation: -40 }, { autoAlpha: 1, scale: 1, rotation: 8, duration: .25, ease: 'pop' }, 3.25);
    ft(tl, '[data-ed-q]', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .25, ease: 'out' }, 3.45);
    const mode = roll($('[data-roll="mode"]', el));
    watch(tl, t => { apply(); mode(t >= 3.2 ? 1 : 0); });
  }

  /* ---------- SERVIÇOS — trilho horizontal ---------- */
  if (has('servicos')) {
    const el = $('#servicos'), track = $('[data-track]', el);
    gsap.fromTo(words($('[data-sv-title]', el)), { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: .08, duration: .8, ease: 'out', scrollTrigger: { trigger: el, start: 'top 65%', toggleActions: 'play none none reverse' } });
    const h = gsap.to(track, { x: () => -(track.scrollWidth - innerWidth), ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: SCRUB, invalidateOnRefresh: true } });
    const ptl = (p, start, end) => gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: p, containerAnimation: h, start, end, scrub: true } });
    const cap = $('[data-panel="cap"]', el);
    ptl(cap, 'left 100%', 'center 50%')
      .fromTo($$('[data-vfbr]', cap), { scale: 1.9, autoAlpha: .15 }, { scale: 1, autoAlpha: 1 }, 0)
      .fromTo($('.phone', cap), { rotation: -8, scale: .9 }, { rotation: 0, scale: 1 }, 0);
    // antes (esquerda) → depois (direita): a foto editada entra pela direita e cobre tudo
    ptl($('[data-panel="ed"]', el), 'left 85%', 'right 75%')
      .fromTo('[data-ba-ed]', { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }, 0)
      .fromTo('[data-ba-handle]', { left: '100%' }, { left: '0%' }, 0);
    const est = $('[data-panel="est"]', el), feed = $('[data-feed]', est), fimg = $('img', feed), cnt = $('[data-count]', est), n = { v: 0 };
    ptl(est, 'left 95%', 'right 100%')
      .fromTo(fimg, { y: 0 }, { y: () => -(fimg.offsetHeight - feed.offsetHeight), ease: 'inout' }, 0)
      .fromTo('[data-stat]', { autoAlpha: 0, x: 60, rotation: 10 }, { autoAlpha: 1, x: 0, rotation: -4, duration: .3, ease: 'pop' }, .2)
      .to(n, { v: +cnt.dataset.count, duration: .5, onUpdate: () => { cnt.textContent = Math.round(n.v).toLocaleString('pt-BR'); } }, .25);
  }

  /* ---------- SELETOR DE CASES + PRÓXIMO CASE ---------- */
  const preview = $('[data-preview]');
  if (preview && hover) {
    const qx = gsap.quickTo(preview, 'x', { duration: .6, ease: 'power3' }), qy = gsap.quickTo(preview, 'y', { duration: .6, ease: 'power3' });
    addEventListener('pointermove', e => { qx(e.clientX + 24); qy(e.clientY - preview.offsetHeight / 2); }, { passive: true });
  }
  $$('[data-row]').forEach(row => {
    const pos = e => { const r = row.getBoundingClientRect(); row.style.setProperty('--x', ((e.clientX - r.left) / r.width * 100) + '%'); row.style.setProperty('--y', ((e.clientY - r.top) / r.height * 100) + '%'); };
    row.addEventListener('pointerenter', e => { pos(e); if (preview && hover && row.dataset.previewSrc) { preview.src = ROOT + row.dataset.previewSrc; preview.classList.add('on'); } });
    row.addEventListener('pointerleave', e => { pos(e); preview && preview.classList.remove('on'); });
  });
  ['cases', 'next'].forEach(id => {
    if (!has(id)) return;
    const el = $('#' + id), rows = $$('[data-row]', el);
    const title = $('[data-cs-title]', el);
    const t = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 70%', toggleActions: 'play none none reverse' } });
    if (title) t.from(new SplitText(title, { type: 'chars', mask: 'chars' }).chars, { yPercent: 110, duration: .7, stagger: .025, ease: 'out' });
    t.from($$('[data-cs-in], [data-nx-in]', el), { autoAlpha: 0, y: 16, duration: .5, stagger: .08, ease: 'out' }, '<.1')
      .from(rows.map(r => $('.cr-name', r)), { yPercent: 100, autoAlpha: 0, duration: .8, stagger: .1, ease: 'out' }, '<.1');
  });

  /* ---------- CASE GLOBAR · abertura ---------- */
  if (has('globar-open')) {
    const { el, tl } = scene('globar-open', 1);
    const media = $('[data-go-media]', el), img = $('img', media), title = $('[data-go-title]', el);
    const rest = getComputedStyle(media).clipPath;
    tl.fromTo(media, { clipPath: rest }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: .6, ease: 'inout' }, .05)
      .fromTo(img, { scale: 1.08 }, { scale: 1, duration: .7 }, .05)
      .to(title, { yPercent: -30, autoAlpha: 0, duration: .35 }, .1)
      .fromTo(media, { '--shade': 0 }, { '--shade': 1, duration: .3 }, .4)
      .fromTo('[data-go-cap]', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .2, ease: 'out' }, .7);
    const chars = new SplitText($('[data-go-name]', el), { type: 'chars', mask: 'chars' }).chars;
    gsap.set(media, { autoAlpha: 0 }); gsap.set(chars, { yPercent: 110 }); gsap.set($$('[data-go-in]', el), { autoAlpha: 0, y: 16 });
    enter(el, t => t
      .to(media, { autoAlpha: 1, duration: .8, ease: 'out' }, 0)
      .fromTo(img, { scale: 1.3 }, { scale: 1.08, duration: 1.4, ease: 'out' }, 0)
      .to(chars, { yPercent: 0, duration: .8, stagger: .06, ease: 'pop' }, .2)
      .to($$('[data-go-in]', el), { autoAlpha: 1, y: 0, duration: .5, stagger: .08, ease: 'out' }, .5));
  }

  /* ---------- CASE GLOBAR · fotos caem e empilham ---------- */
  if (has('globar')) {
    const { el, tl } = scene('globar', 1);
    const cards = $$('[data-st]', el), pills = $$('[data-pill]', el);
    ft(tl, $$('.case-n, h2, p', $('[data-case-head]', el)), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, stagger: .02, duration: .06, ease: 'out' }, 0);
    const step = .78 / cards.length;
    cards.forEach((c, i) => ft(tl, c, { y: () => -innerHeight * 1.25, x: () => rnd(-140, 140), rotation: rnd(-35, 35) },
      { y: () => rnd(-24, 24), x: () => rnd(-50, 50) * (mobile() ? .4 : 1), rotation: rnd(-9, 9), duration: step * .85, ease: 'out' }, .08 + i * step));
    ft(tl, '[data-case-foot]', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .06, ease: 'out' }, .9);
    let on = -1;
    watch(tl, t => {
      const i = Math.min(cards.length - 1, Math.floor((t - .08 - step * .4) / step));
      if (i === on) return;
      if (pills[on]) gsap.to(pills[on], { autoAlpha: 0, y: -16, duration: .2, overwrite: true });
      if (pills[i]) gsap.fromTo(pills[i], { autoAlpha: 0, y: 16, scale: .7, rotation: rnd(-8, 8) }, { autoAlpha: 1, y: 0, scale: 1, rotation: rnd(-3, 3), duration: .4, ease: 'pop', overwrite: true });
      on = i;
    });
  }

  /* ---------- REELS ---------- */
  if (has('reels')) {
    const { el, tl } = scene('reels', 1);
    const ph = $$('[data-rl]', el), mid = (ph.length - 1) / 2;
    ft(tl, words($('[data-rl-title]', el)), { autoAlpha: 0, yPercent: 60 }, { autoAlpha: 1, yPercent: 0, stagger: .025, duration: .12, ease: 'out' }, 0);
    ft(tl, ph, { y: () => innerHeight, rotation: i => (i - mid) * 26 }, { y: 0, rotation: i => (i - mid) * 8, stagger: .08, duration: .3, ease: 'out' }, .15);
    tl.to(ph, { rotation: i => (i - mid) * 3, duration: .3 }, .65);
  }

  /* ---------- CASE GLOBAR · feed ---------- */
  if (has('globar-feed')) {
    const { el, tl } = scene('globar-feed', 1);
    const feed = $('[data-gf-feed]', el), fimg = $('img', feed);
    ft(tl, words($('[data-gf-title]', el)), { autoAlpha: 0, yPercent: 70 }, { autoAlpha: 1, yPercent: 0, stagger: .03, duration: .12, ease: 'out' }, 0);
    ft(tl, $$('[data-gf-in]', el), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, stagger: .05, duration: .1, ease: 'out' }, .08);
    ft(tl, '[data-gf-phone]', { y: () => innerHeight * .6, rotation: 8 }, { y: 0, rotation: -2, duration: .25, ease: 'out' }, .05);
    tl.fromTo(fimg, { y: 0 }, { y: () => -(fimg.offsetHeight - feed.offsetHeight), duration: .65, ease: 'inout' }, .3);
    $$('[data-gf-count]', el).forEach(b => { const o = { v: 0 }; tl.to(o, { v: +b.dataset.gfCount, duration: .35, onUpdate: () => { b.textContent = Math.round(o.v).toLocaleString('pt-BR'); } }, .2); });
    ft(tl, $$('[data-gf-chip]', el), { autoAlpha: 0, scale: .5, rotation: () => rnd(-15, 15) }, { autoAlpha: 1, scale: 1, rotation: () => rnd(-3, 3), stagger: .05, duration: .12, ease: 'pop' }, .55);
  }

  /* ---------- CASE MOSTARDA — logo monta, grãozinho troca de humor e sai pra entrega ---------- */
  if (has('mostarda')) {
    const { el, tl } = scene('mostarda', 5);
    const stage = $('[data-ms-stage]', el), logo = $('[data-ms-logo]', el), rows = $$('[data-ms-row]', el);
    const grao = $('[data-grao]', el), faces = $$('[data-face]', el), speed = $('[data-speed]', el);
    const why = words($('[data-ms-why]', el)), cnt = $('[data-ms-i]', el), label = roll($('[data-roll="state"]', el));
    const T = [.55, 1.25, 1.95, 2.65, 3.35];
    const bg = ['#E3AE2F', '#EDDDCC', '#220D08', '#B33B1B', '#E3AE2F'];
    const fg = ['#220D08', '#220D08', '#EDDDCC', '#EDDDCC', '#220D08'];
    gsap.set($$('.case-n, h2', $('[data-ms-head]', el)), { autoAlpha: 0, y: 24 });
    gsap.set(rows, { xPercent: i => (i % 2 ? 130 : -130), rotation: i => (i % 2 ? 8 : -8) });
    gsap.set(why, { autoAlpha: 0, y: 20 });
    enter(el, t => t
      .to($$('.case-n, h2', $('[data-ms-head]', el)), { autoAlpha: 1, y: 0, stagger: .08, duration: .5, ease: 'out' }, 0)
      .to(rows, { xPercent: 0, rotation: 0, duration: .7, stagger: .18, ease: 'pop' }, .1)
      .to(why, { autoAlpha: 1, y: 0, stagger: .04, duration: .4, ease: 'out' }, .7));
    tl.to(logo, { scale: .5, y: () => -innerHeight * .12, autoAlpha: 0, duration: .3, ease: 'inout' }, .25)
      .to('[data-ms-why]', { autoAlpha: 0, y: -20, duration: .2 }, .25);
    ft(tl, grao, { scale: 0, rotation: -60 }, { scale: 1, rotation: 0, duration: .3, ease: 'pop' }, .35);
    ft(tl, '.ms-state', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .2, ease: 'out' }, .45);
    T.forEach((t, i) => {
      if (!i) return;
      tl.to(stage, { backgroundColor: bg[i], color: fg[i], duration: .2 }, t - .12)
        .to(grao, { keyframes: { scaleX: [1, 1.2, .9, 1], scaleY: [1, .8, 1.1, 1] }, duration: .3, ease: 'sine.inOut' }, t - .08);
    });
    tl.to(speed, { opacity: 1, duration: .05 }, T[4])
      .fromTo($$('b', speed), { scaleX: 0 }, { scaleX: 1, stagger: .04, duration: .15, ease: 'out' }, T[4])
      .to(grao, { x: () => innerWidth * .9, rotation: 18, duration: .4, ease: 'power2.in' }, T[4] + .4)
      .to('.ms-state', { autoAlpha: 0, duration: .15 }, T[4] + .55)
      .to(stage, { backgroundColor: bg[0], color: fg[0], duration: .15 }, T[4] + .6)
      .to(logo, { autoAlpha: 1, scale: () => (mobile() ? .62 : .72), y: () => -innerHeight * (mobile() ? .14 : .1), duration: .35, ease: 'pop' }, 4.15);
    ft(tl, $$('[data-sw]', el), { autoAlpha: 0, scale: 0, rotation: -120 }, { autoAlpha: 1, scale: 1, rotation: 0, stagger: .1, duration: .3, ease: 'pop' }, 4.25);
    tl.to($$('[data-sw] svg', el), { rotation: 60, duration: .7 }, 4.3);
    gsap.set(faces, { autoAlpha: 0 }); gsap.set(faces[0], { autoAlpha: 1 });
    let on = 0;
    watch(tl, t => {
      let i = 0; T.forEach((x, k) => { if (t >= x - .02) i = k; });
      if (i === on) return;
      gsap.set(faces, { autoAlpha: 0 }); gsap.set(faces[i], { autoAlpha: 1 });
      label(i); cnt.textContent = String(i + 1).padStart(2, '0');
      if (i < 4) gsap.set(speed, { opacity: 0 });
      on = i;
    });
  }

  /* ---------- MOSTARDA · aplicação ---------- */
  if (has('mostarda-app')) {
    const { el, tl } = scene('mostarda-app', 1);
    const ph = $('[data-ma-photo]', el), polas = $$('[data-pola]', el);
    ft(tl, ph, { clipPath: 'inset(32% 26% 32% 26% round 999px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: .35, ease: 'inout' }, 0);
    ft(tl, $('img', ph), { scale: 1.3 }, { scale: 1, duration: .5 }, 0);
    tl.to($('img', ph), { filter: 'brightness(.42)', duration: .2 }, .42);
    ft(tl, polas, { y: () => -innerHeight * 1.2, rotation: i => [-40, 25, 40][i] }, { y: 0, rotation: 0, stagger: .1, duration: .22, ease: 'out' }, .45);
    ft(tl, '[data-ma-slogan]', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .15, ease: 'out' }, .82);
  }

  /* ---------- CASE DUDA BORGUE · abertura: a boca "beija" e a gente entra nela ---------- */
  if (has('duda-open')) {
    const { el, tl } = scene('duda-open', 1);
    const lips = $('[data-db-lips]', el), line = words($('[data-db-line]', el)), head = $$('.case-n, h2', $('[data-db-head]', el));
    gsap.set(head, { autoAlpha: 0, y: 24 }); gsap.set(lips, { scale: .15, autoAlpha: 0, rotation: -12 }); gsap.set(line, { autoAlpha: 0, yPercent: 60 });
    enter(el, t => t
      .to(head, { autoAlpha: 1, y: 0, stagger: .08, duration: .5, ease: 'out' }, 0)
      .to(lips, { scale: 1, autoAlpha: 1, rotation: 0, duration: .9, ease: 'pop' }, .15)
      .to(lips, { keyframes: { scaleX: [1, .84, 1.08, 1], scaleY: [1, 1.18, .94, 1] }, duration: .6, ease: 'sine.inOut' }, 1)
      .to(line, { autoAlpha: 1, yPercent: 0, stagger: .06, duration: .5, ease: 'out' }, 1.1));
    tl.fromTo('[data-db-pattern]', { xPercent: 0, yPercent: 0 }, { xPercent: -6, yPercent: -10, duration: 1 }, 0)
      .to('[data-db-line]', { autoAlpha: 0, y: -20, duration: .2 }, .25)
      .to(head, { autoAlpha: 0, duration: .2 }, .3)
      .fromTo(lips, { scale: 1 }, { scale: 9, duration: .6, ease: 'power2.in' }, .35)
      .to(lips, { autoAlpha: 0, duration: .15 }, .8);
  }

  /* ---------- DUDA · aplicações ---------- */
  if (has('duda-brand')) {
    const { el, tl } = scene('duda-brand', 1);
    tl.fromTo('[data-dbb-pattern]', { xPercent: 0, yPercent: 0 }, { xPercent: -6, yPercent: -10, duration: 1 }, 0);
    ft(tl, words($('[data-dbb-title]', el)), { autoAlpha: 0, yPercent: 70 }, { autoAlpha: 1, yPercent: 0, stagger: .02, duration: .12, ease: 'out' }, .02);
    ft(tl, '[data-dbb-bag]', { y: () => innerHeight * .9, rotation: -28 }, { y: 0, rotation: 0, duration: .35, ease: 'out' }, .12);
    tl.to('[data-dbb-bag]', { keyframes: { rotation: [0, 7, -5, 3, 0] }, duration: .35, ease: 'sine.inOut' }, .47);
    ft(tl, '[data-dbb-paper]', { x: () => innerWidth * .7, rotation: 40 }, { x: 0, rotation: 5, duration: .38, ease: 'out' }, .25);
  }

  /* ---------- DUDA · posts em leque ---------- */
  if (has('duda-posts')) {
    const { el, tl } = scene('duda-posts', 1);
    const cards = $$('[data-dp-card]', el), mid = (cards.length - 1) / 2;
    const gap = () => (mobile() ? innerWidth * .2 : Math.min(260, innerWidth * .16));
    ft(tl, $$('[data-dp-in]', el), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: .08 }, 0);
    ft(tl, words($('[data-dp-title]', el)), { autoAlpha: 0, yPercent: 70 }, { autoAlpha: 1, yPercent: 0, stagger: .025, duration: .12, ease: 'out' }, .02);
    ft(tl, cards, { y: () => innerHeight, x: 0, rotation: 0 }, { y: 0, x: i => (i - mid) * gap(), rotation: i => (i - mid) * 10, stagger: .1, duration: .35, ease: 'out' }, .15);
    tl.to(cards, { rotation: i => (i - mid) * 4, x: i => (i - mid) * gap() * 1.12, duration: .3 }, .7);
  }

  /* ---------- faixas ---------- */
  $$('[data-band]').forEach(b => {
    const d = +b.dataset.band;
    gsap.fromTo(b.firstElementChild, { xPercent: d > 0 ? 0 : -25 }, { xPercent: d > 0 ? -25 : 0, ease: 'none', scrollTrigger: { trigger: '.bands', start: 'top bottom', end: 'bottom top', scrub: SCRUB } });
  });

  /* ---------- fechamento ---------- */
  if (has('contato')) {
    const el = $('#contato');
    const chars = $$('[data-cl-chars]', el).flatMap(p => new SplitText(p, { type: 'chars', mask: 'chars' }).chars);
    gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 55%', toggleActions: 'play none none reverse' } })
      .from(chars, { yPercent: 115, rotation: () => rnd(-20, 20), duration: .7, ease: 'pop', stagger: .03 })
      .to('[data-cl-line]', { strokeDashoffset: 0, duration: .7, ease: 'inout' }, '-=.35')
      .from('[data-role]', { autoAlpha: 0, y: 20, rotation: () => rnd(-10, 10), duration: .4, stagger: .08, ease: 'pop' }, '-=.4')
      .from('[data-cta]', { autoAlpha: 0, scale: .6, duration: .5, stagger: .08, ease: 'pop' }, '-=.2');
    $$('[data-cl-star]', el).forEach((s, i) => gsap.to(s, { rotation: i ? -360 : 360, duration: 34 + i * 12, repeat: -1, ease: 'none' }));
  }

  /* =========================================================
     NAVEGAÇÃO: cortina na cor da marca, depois troca de página
     ========================================================= */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-nav]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    const url = new URL(a.href, location.href);
    e.preventDefault();
    if (url.pathname === location.pathname) { lenis.scrollTo(url.hash || 0); return; }
    paintCurtain(a.dataset.color || '#140904', a.dataset.name);
    curtain.style.display = 'grid';
    const x = e.clientX || innerWidth / 2, y = e.clientY || innerHeight / 2;
    lenis.stop();
    gsap.timeline()
      .fromTo(curtain, { clipPath: `circle(0% at ${x}px ${y}px)` }, { clipPath: `circle(150% at ${x}px ${y}px)`, duration: .75, ease: 'inout' })
      .fromTo(cName, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: .45, ease: 'out' }, .35)
      .add(() => { try { sessionStorage.setItem('brio-curtain', JSON.stringify({ color: a.dataset.color || '#140904', name: a.dataset.name || '' })); } catch (_) {} location.href = a.href; }, '+=.05');
  });

  /* =========================================================
     CHEGADA: loader (1ª visita) ou cortina (vindo de outra página) → intros
     ========================================================= */
  const firstImgs = $$('img', sections[0]).slice(0, 3);
  const ready = Promise.race([
    Promise.all(firstImgs.map(im => (im.decode ? im.decode().catch(() => {}) : Promise.resolve()))).then(() => document.fonts && document.fonts.ready),
    new Promise(r => setTimeout(r, 3000)),
  ]);
  const start = () => {
    lenis.start();
    if (location.hash && $(location.hash)) lenis.scrollTo(location.hash, { immediate: true, force: true });
  };
  const playIntros = () => intros.forEach(t => t.play());

  if (via) {
    ready.then(() => {
      ScrollTrigger.refresh();
      if (location.hash && $(location.hash)) lenis.scrollTo(location.hash, { immediate: true, force: true });
      gsap.timeline({ onComplete: () => { curtain.style.display = 'none'; html.classList.remove('via-curtain'); } })
        .to(cName, { yPercent: -60, autoAlpha: 0, duration: .35, ease: 'inout' })
        .to(curtain, { clipPath: 'inset(0% 0% 100% 0%)', duration: .8, ease: 'inout' }, .1)
        .add(playIntros, .45)
        .add(start, .6);
    });
  } else {
    const loader = $('[data-loader]'), ldTc = $('[data-tc]', loader), ldPct = $('[data-pct]', loader), cnt = { p: 0 };
    const upd = () => { ldPct.textContent = Math.round(cnt.p); ldTc.textContent = tc(cnt.p / 100 * 3.4); };
    const ld = gsap.timeline();
    ld.to(cnt, { p: 82, duration: 1.1, ease: 'power2.out', onUpdate: upd });
    ready.then(() => {
      ScrollTrigger.refresh();
      ld.to(cnt, { p: 100, duration: .35, ease: 'power1.in', onUpdate: upd })
        .to($$('.lb', loader), { scale: 1.6, autoAlpha: 0, duration: .5, ease: 'out' })
        .to(loader, { clipPath: 'inset(0% 0% 100% 0%)', duration: .8, ease: 'inout' }, '<.1')
        .set(loader, { display: 'none' })
        .add(playIntros, '<-.55')
        .add(start, '<.6');
    });
  }

  addEventListener('load', () => ScrollTrigger.refresh());
})();
