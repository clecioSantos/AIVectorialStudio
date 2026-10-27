# Roadmap — AI Vectorial Studio

## Próxima etapa futura (adiada por decisão do usuário)

### Editor visual de montagem modular
**Status:** planejado; não iniciar antes de priorização explícita.

- Arrastar componentes reutilizáveis diretamente do catálogo para a arte ou personagem.
- Posicionar/editar sockets visualmente sobre o canvas e encaixar equipamentos e partes por esses pontos.
- Substituir peças mantendo alinhamento, escala, pivô e transformações.
- Agrupar peças como montagens reutilizáveis e preparar hierarquia/pivôs para animação 2D posterior.
- Evoluir instâncias vinculadas para propagação de geometria com versionamento, prévia e controle de conflitos.
- Testar interações de montagem, transformações e exportação com transparência alfa real.

## Prioridade atual: materiais e texturas

Auditar a aplicação efetiva de style.json no SVG gerado e definir o próximo incremento: biblioteca de materiais, texturas vetoriais reutilizáveis (padrões, madeira, metal, pedra, tecido), edição por camada e exportação SVG/PNG. Distinguir claramente os campos de estilo já aceitos das texturas realmente renderizadas. Manter estética minimalista, desenhada à mão, pouca textura e cores vivas.


## Etapa planejada: Tileset vetorial seamless (sem emendas)

**Status:** no roadmap; implementar depois da fundação da biblioteca de materiais/texturas vetoriais. Não iniciar a implementação nesta etapa.

### Objetivo
Criar blocos de chão, paredes, plataformas e superfícies 2D como **geometria e padrões SVG editáveis**, capazes de se repetir N vezes horizontalmente e/ou verticalmente sem linhas, cortes, mudanças de cor ou marcas nas junções.

### Requisitos funcionais
- **Modo tile repetível:** definir largura/altura exatas em unidades vetoriais (por exemplo 32×32, 64×64, 179×179) e repetir em malha, incluindo repetição 1D para plataformas e 2D para fundos.
- **Continuidade de bordas:** bordas opostas devem manter continuidade de cor, contorno, textura, geometria e fase do padrão, inclusive em mudanças de escala e exportação; elementos que cruzem uma borda devem reaparecer coerentemente na borda oposta.
- **Editor de costura:** prévia 3×3 e faixas repetidas com visualização de junções, ajuste de offset e alinhamento fino, além de teste automatizado de pixels das bordas de PNG quando apropriado.
- **Sem linhas falsas:** não desenhar contorno ou sombra em toda a borda de cada tile; manter a linha do topo de uma plataforma apenas onde houver topo exposto.
- **Variantes de conexão:** centro, lateral esquerda/direita, topo, base, cantos internos/externos e transições de terreno por regras (autotile / bitmask / Wang tiles), sem quebrar o encaixe.
- **Tiles para plataforma:** topo com relevo controlado e colisão plana configurável para não atrapalhar movimentação; separar geometria visual de metadados de colisão.
- **Texturas vetoriais:** reutilizar padrões SVG da biblioteca de materiais (madeira, pedra, terra, grama, tecido, metal) com escala/fase estáveis entre tiles adjacentes, evitando texturas bitmap como fonte principal.
- **Biblioteca reutilizável:** salvar tile, família de variantes, material, metadados de encaixe, versão e tags como assets reaproveitáveis entre fases/projetos.
- **Exportação:** SVG individuais, atlas PNG com transparência alfa real, manifesto JSON com grid, pivôs, regras de vizinhança e colisão; sem sobreposição ou sangramento entre frames.
- **Controle de qualidade:** testes geométricos e de rasterização para linhas de costura, bleed, escala, margens e repetição; prévia visual para validação manual.

### Sequência sugerida
1. Fundar **Materiais e Texturas Vetoriais V1**: biblioteca de SVG patterns e aplicação em camadas.
2. Criar **Tile Seamless V1**: editor de um tile repetível, prévia 3×3 e verificação de bordas.
3. Evoluir para **Tileset V2**: transições, cantos, autotiling, bitmask e biblioteca de famílias.
4. Integrar **Exportação para jogos**: spritesheet/atlas, JSON de vizinhança e dados de colisão.

### Critério de aceite principal
Um tile de chão gerado e salvo pode ser repetido 20 vezes lado a lado, mantendo o aspecto de uma plataforma contínua sem marcas visíveis de junção, inclusive no PNG exportado.

## Estado encontrado em 2026-10-27

- Campos `materials.*.textureStyle`, `roughness`, `reflectivity` etc. aceitos pelo schema; não há renderizador de texturas ou `pattern` SVG dedicado.
- Cores e contornos por camada; coleções podem recolorir materiais e adicionar ornamentos vetoriais.
- Componentes vetoriais reutilizáveis por projeto; exportação/importação em pacotes JSON.
- Exportação SVG/PNG transparente e atlas PNG+JSON.
