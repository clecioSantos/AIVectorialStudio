# AI Vectorial Studio — MVP local

Aplicação React + TypeScript + Vite para criar projetos de ilustração vetorial independentes, editar camadas SVG e persistir dados no navegador.

## Execução

```bash
npm install
npm run dev
```

Acesse o endereço informado pelo Vite. Para gerar uma versão estática, execute `npm run build`. Use Node.js 20.19+ ou 22.12+ (consulte a documentação do Vite para compatibilidade exata).

## Recursos implementados

- Vários projetos isolados, com nome, descrição, identidade visual e biblioteca própria.
- Presets de estilo medieval, ficção científica e ícones minimalistas; importação e exportação de `style.json`.
- Esquema Zod estrito, com validação de propriedades e limites numéricos, incluindo alertas para chaves desconhecidas.
- Revisões de estilo restauráveis (histórico de snapshots armazenados em IndexedDB).
- Resolução de estilo por camada: padrão → projeto → categoria → arte; mesclagem profunda de objetos e substituição integral de arrays.
- Gerador local demonstrativo que reconhece espada, escudo, poção, machado e estrela; demais prompts produzem uma composição genérica. **Não é um modelo de IA.**
- Interpretação de JSON de formas (`rect`, `ellipse`, `path`, `polygon`) para geração de desenhos editáveis.
- Editor SVG com seleção de camadas, alteração de cores, opacidade, tamanho e posição de retângulos/elipses, duplicação, remoção, adição de formas e zoom.
- Componentes reutilizáveis armazenados por projeto.
- SVG editável e PNG gerado por canvas com canal alfa real, sem fundo quadriculado na imagem exportada.
- Backup de projetos como JSON; persistência local com Zustand + IndexedDB (`idb-keyval`).

## Estado atual e limitações

Este pacote é um **MVP**, não o produto final. Ele não oferece geração livre por inteligência artificial, vetorização de imagens bitmap, manipulação avançada de nós Bézier, ferramenta caneta, undo/redo, colaboração, autenticação, backend ou comparador gráfico de diferenças entre versões. A arquitetura inclui a interface `GenerationProvider` para integrar provedores de IA futuramente por um backend seguro (não exponha chaves de provedores no frontend).

Alterar `x`/`y` de formas `path` e `polygon` ainda exige edição das coordenadas internas `d`/`points`; na versão demonstrativa, a movimentação visual por arraste só está completa para `rect` e `ellipse`. Os prompts seguem templates; a interpretação semântica aberta está fora do escopo deste MVP. Os arquivos dos projetos são armazenados no IndexedDB do navegador atual: faça backups JSON para portabilidade.

A instalação e o build não puderam ser executados integralmente no ambiente de preparação por indisponibilidade de acesso ao registro npm. Execute-os na sua máquina para validação.

## Formato dos estilos

`src/core/schema.ts` é a referência canônica e define todas as propriedades aceitas. `src/core/generator.ts` contém o contrato de provedores. Em `src/core/schema.ts`, `mergeStyle()` usa estas regras:

1. Objetos: mesclagem recursiva por propriedade.
2. Arrays: substituição integral, não concatenação.
3. Primitivos: o último valor especificado substitui o anterior.
4. Propriedades ausentes/`undefined`: herdam o valor da camada anterior.
5. `null`: não é usado como remoção; falha na validação quando incompatível.

Escalas `realism`, `complexity`, `detailLevel`, `roughness`, `metallic`, `variation`, `roundness`, `intensity`, `gradientStrength`, `curvature`, `symmetry`, `exaggeration`, `padding` e `opacity` são normalizadas de 0 a 1. `outlines.width` varia de 0 a 40 unidades SVG. `defaultSize` varia de 32 a 4096 pixels. Cores devem estar no formato hexadecimal `#RRGGBB`.

A revisão do estilo é sempre preservada no projeto; a versão semântica `version` é preenchida pelo usuário e não incrementada automaticamente. O histórico conserva snapshots completos, permitindo restaurar revisões anteriores.

## Próximos passos sugeridos

1. Editor SVG completo com transformação matricial universal, path editing, undo/redo e múltipla seleção.
2. Protocolo de geração IA: converter prompt + `style.json` em uma especificação de cena com formas, geometria e materiais, validada no frontend.
3. Mecanismo de consistência visual com biblioteca de símbolos/componentes e testes de estilo.
4. Integração com um backend para armazenar projetos, chamar modelos sem expor credenciais e versionar assets.
5. Testes automatizados (unitários, e2e, exportação alfa, isolamento entre projetos e migrações de esquema).
