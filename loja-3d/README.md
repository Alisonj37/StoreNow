# StoreNow — fones de ouvido Bluetooth (loja de afiliados 3D)

Vitrine em português (BR) de um nicho só: **fones de ouvido Bluetooth**, com produtos reais
da Amazon e a foto do produto em 3D no topo (WebGL/Three.js). Funciona no computador e no celular.

Por que esse nicho: segundo o Semrush (base Brasil, consulta de 28/09/2026), “fone de ouvido
bluetooth” tem cerca de 301 mil buscas por mês, “fone bluetooth” 74 mil e “fone sem fio” 40,5 mil.
São estimativas; confira no Semrush antes de decisões grandes.

## Como editar os produtos

Abra `js/produtos.js`.

1. **Coloque sua tag da Amazon** em `CONFIG.tagAmazon` (ex.: `"seunome-20"`). O site monta o link
   de afiliado de cada produto com o ASIN + sua tag. Sem a tag, os links abrem a Amazon **sem comissão**.
2. Para trocar ou adicionar um fone, copie um bloco e mude `nome`, `asin`, `categoria` e `specs`.
   O ASIN fica na URL do produto: `amazon.com.br/dp/ASIN`.
3. `imagem` é o código da foto na Amazon: abra a foto do produto, copie o trecho depois de
   `/images/I/` e antes do primeiro ponto (ex.: `51TL2aLCIpL`). Também aceita uma URL completa.
4. Se você já tem um link pronto (ex.: `https://link.amazon/...`), coloque em `link`; ele tem prioridade.
5. `destaque: true` coloca o produto no carrossel 3D do topo (até 4).
6. Mercado Livre: adicione produtos com `loja: "mercadolivre"` e o link gerado na Central de Afiliados
   em `link`. Os botões e filtros do Mercado Livre aparecem sozinhos quando houver produtos dele.

Não coloque preço fixo: a Amazon pede preço atualizado da fonte oficial.

## Como ver no seu computador

O navegador não carrega os scripts 3D abrindo o arquivo direto (`file://`). Rode um servidor simples
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
- As fotos dos produtos são carregadas direto do servidor de imagens da Amazon (`m.media-amazon.com`).
- Three.js (licença MIT).
