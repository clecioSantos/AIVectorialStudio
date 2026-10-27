# Estilos avançados (style.json)

A importação reconhece campos avançados de direção artística, paleta, contornos, iluminação, geometria, materiais, composição e exportação.

## Campos suportados

- `artDirection.aestheticReferences`, `desiredCharacteristics`, `forbiddenCharacteristics`
- `palette.accent` e `palette.lighting` (string HEX ou lista HEX)
- `outlines.smoothness`, `lineCap`, `lineJoin`
- `lighting.temperature` (warm/neutral/cool ou numérico legado), `highlightIntensity`, `ambientOcclusion`
- `geometry.proportionStyle`, `shapeLanguage`, `detailDensity`, `edgeSharpness`
- `materials.*.reflectivity`, `textureStyle`, `shadowIntensity`
- `composition.alignment`, `framing`, `scale`, novas perspectivas, cor HEX no background
- `export.preserveLayers`, `svgOptimization`, `pngScale`

## Compatibilidade

Os campos legados `references`, `desired`, `forbidden`, `cap`, `proportions`, `detailComplexity`, `front` e `top-down` são convertidos automaticamente. A validação continua rejeitando campos desconhecidos e valores inválidos.

## Uso efetivo

O modo OpenAI recebe o estilo completo resolvido, incluindo atributos avançados, como orientação artística. O modo procedural tem repertório limitado: usa cor de destaque, realce e reflexão para as formas pré-definidas; densidade de detalhe, arredondamento, ambiente e contornos influenciam parcialmente a geometria. Recursos como texturas vetoriais detalhadas, edição de nós e efeitos de iluminação fisicamente corretos **ainda não estão implementados**. Aceitar um campo não equivale a renderizar esse efeito em todos os geradores.

A versão mantida no repositório exige `npm install` após um `git pull`. A integração OpenAI requer uma chave de API separada; veja `docs/AI_GENERATION.md`.
