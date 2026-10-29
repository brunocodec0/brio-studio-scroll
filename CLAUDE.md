# Site da BRIO STUDIO (cliente: Clara) — LEIA ANTES DE MEXER

Este arquivo é só deste site. O site pessoal do Bruno fica em `../codeco-site/` e tem o CLAUDE.md dele.
**Não misture os dois**: feedback, fotos e textos de um não valem pro outro.

## Estado atual: v3 (29/10/2026), feita a partir do roteiro de ajustes da Clara
- No ar: https://brio-studio-scroll.vercel.app/ (repo `brunocodec0/brio-studio-scroll`).
- A Clara escolheu a **versão B** (home + "escolha um case" → cada case em página própria). `tudo-junto.html` continua sendo gerado, mas não é o oficial.
- Home: abertura (fundo liso + estrela + logo, sem fotos) → manifesto ("tem marca que só posta. a gente faz ela ser lembrada.") → o que eu faço (01 foto e vídeo / 02 design / 03 roteiro e estratégia / 04 sites) → resultado Globar (101,5K) → cases → faixas → "oi, eu sou a Clara".
- Botão fixo "bora conversar" (Instagram DM) em todas as páginas.
- Fontes hospedadas em `assets/fonts` (não usa mais o Google Fonts).

## Decisões da Clara (não desfazer)
- Abertura sem fotos de comida: ela quer se desvincular de "só restaurante".
- Sem a cena "role pra editar" e sem o contador "0 MB" (cansativo pra cliente mais velho).
- Globar: usar o resultado do vídeo (101,5K visualizações, +4,3 mil salvamentos), não o número de seguidores (é baixo).
- Mostarda: dar destaque às aplicações/mockups.
- Animações leves e respeitando "reduzir movimento".

## v3.1 (29/10/2026) — ajustes pedidos depois da v3
- Resultados do Globar: dois números lado a lado (157K num post / 101,5K em outro).
- Foto da Clara recortada (sem círculo), grande e de lado, ao lado do texto.
- Design: 2 carrosséis inteiros (dentista e curso de unhas) lado a lado no trilho. O do restaurante saiu (card ficava largo demais).
- WhatsApp da Brio: +55 21 99954-7760.

## Pendências
- Publicar no GitHub (a Vercel atualiza sozinha).

## Material bruto
`fotos-brio/` = o que a Clara manda (originais). Não sobe pro GitHub (.gitignore). O site usa as versões leves em `assets/`.

## Como editar
Textos em `_src/sections.html` → `python _src/build.py` → páginas geradas. Animações em `js/main.js`, visual em `css/style.css`.
