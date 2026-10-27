# Geração vetorial com IA (fase 1 e 2)

O aplicativo possui dois modos: **Procedural (demonstração)** e **OpenAI (SVG por IA)**. No segundo, o navegador envia prompt, categoria e estilo resolvido ao endpoint local `POST /api/generate` do Vite. O endpoint usa a chave de API do ambiente e pede ao modelo um JSON de formas vetoriais. A interface normaliza e valida as formas antes de adicioná-las como camadas editáveis ao projeto.

## Configuração no Windows

1. Instale as dependências com `npm install`.
2. Copie `.env.example` para `.env.local` na raiz do projeto.
3. Preencha `OPENAI_API_KEY` com sua chave da API da OpenAI; opcionalmente defina `OPENAI_MODEL`.
4. Execute `npm run dev` e visite `http://localhost:5180`.
5. Na aba **Criar arte**, escolha **OpenAI (arte SVG por IA)** e descreva a ilustração.

A conta da API e o faturamento são independentes da assinatura do ChatGPT. Nunca publique a chave nem use uma variável `VITE_*` para ela. Se não houver chave, use o modo procedural.

## Limitações

O endpoint é fornecido pelo servidor de desenvolvimento Vite e **não é um backend de produção**. `vite preview` e a hospedagem puramente estática não disponibilizam esse endpoint. Para produção, migre a rota para um backend autenticado com limites de uso. A qualidade artística depende do modelo e do prompt; não há garantia de fidelidade exata nem geração ilimitada. Somente até 60 formas retangulares, elípticas, poligonais ou paths são suportadas. O SVG gerado continua editável por camada, mas ainda não existe edição de nós Bézier. Não foi realizado teste fim a fim com uma chave real da API.

## Próximos passos

Adicionar testes automatizados de contrato, melhorar o editor de caminhos e suportar mais provedores e validação avançada de SVG.


## Google Gemini

O motor **Google Gemini** usa a mesma rota local do Vite, enviando a solicitação pela API Gemini `generateContent` com saída `application/json`. A chave fica somente no servidor.

Adicione ao `.env.local`:

```env
GEMINI_API_KEY=sua_chave_aqui
GEMINI_MODEL=gemini-3.5-flash-lite
```

Reinicie `npm run dev` e selecione **Google Gemini (SVG por IA)** na interface. O modelo `gemini-3.5-flash-lite` é a escolha padrão econômica para JSON estruturado. Para prompts vetoriais mais difíceis, experimente `gemini-3.8-flash` (maior custo). Você pode obter uma chave em https://aistudio.google.com/api-keys . Modelos disponíveis, limites e preços variam conforme a conta e o momento. Nunca publique `.env.local`.

**Nota:** a integração não gera imagens raster nativas do Gemini: solicita JSON de formas SVG editáveis. Um modelo pode devolver geometria limitada e não obedecer perfeitamente ao estilo.
