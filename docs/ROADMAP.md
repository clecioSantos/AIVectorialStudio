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

## Estado encontrado em 2026-10-27

- Campos `materials.*.textureStyle`, `roughness`, `reflectivity` etc. aceitos pelo schema; não há renderizador de texturas ou `pattern` SVG dedicado.
- Cores e contornos por camada; coleções podem recolorir materiais e adicionar ornamentos vetoriais.
- Componentes vetoriais reutilizáveis por projeto; exportação/importação em pacotes JSON.
- Exportação SVG/PNG transparente e atlas PNG+JSON.
