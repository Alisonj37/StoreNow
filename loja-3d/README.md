# StoreNow — loja de afiliados 3D

Vitrine em português (BR) para produtos de afiliado da **Amazon** e do **Mercado Livre**,
com um destaque 3D interativo no topo (WebGL/Three.js). Funciona no computador e no celular.

## Como editar os produtos

Abra `js/produtos.js`. Todos os produtos ali são **exemplos**: troque o nome, a loja,
a categoria e cole o **seu link de afiliado** no campo `link`.

- `destaque: true` coloca o produto no carrossel 3D do topo (até 4 produtos).
- `imagem` é opcional. Sem imagem, o site cria uma arte automática com o ícone da categoria.
- `preco` é opcional. Se você não conseguir manter o preço atualizado, deixe vazio.
- Em `window.CONFIG`, troque `linkGrupo` pelo link do seu grupo de ofertas (WhatsApp, Telegram…).

## Como ver no seu computador

O navegador não carrega o modelo 3D abrindo o arquivo direto (`file://`). Rode um servidor simples
dentro desta pasta:

```bash
python3 -m http.server 8000
```

e abra `http://localhost:8000`.

## Como publicar grátis (GitHub Pages)

1. No GitHub, abra o repositório → **Settings** → **Pages**.
2. Em *Source*, escolha **Deploy from a branch**, selecione a branch e a pasta `/ (root)`.
3. O site fica em `https://<seu-usuario>.github.io/StoreNow/loja-3d/`.

## Créditos

- Efeito 3D baseado em [codrops-noise-transition](https://github.com/mohAmineBrs/codrops-noise-transition) (licença MIT).
- Modelo 3D “Energy Drink Game Ready Model” por dwalsh, [Sketchfab](https://sketchfab.com/3d-models/energy-drink-game-ready-model-83676feb8b0a4589952cf3676299311b), licença CC BY 4.0.
- Three.js (licença MIT).
