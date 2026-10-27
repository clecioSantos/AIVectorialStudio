import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';

function aiApi(): Plugin {
  return {
    name: 'ai-vectorial-api',
    configureServer(server) {
      server.middlewares.use('/api/generate', async (req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({error:'Método não permitido'})); return; }
        const key = process.env.OPENAI_API_KEY;
        if (!key) { res.statusCode = 503; res.end(JSON.stringify({error:'Configure OPENAI_API_KEY no arquivo .env.local e reinicie o Vite.'})); return; }
        try {
          let body = '';
          for await (const chunk of req) { body += chunk.toString(); if (body.length > 100000) throw new Error('Requisição grande demais'); }
          const input = JSON.parse(body);
          if (typeof input.prompt !== 'string' || input.prompt.trim().length < 3 || input.prompt.length > 3000 || !input.style || typeof input.style !== 'object') throw new Error('Prompt ou estilo inválido');
          const system = [
            'Você cria ilustrações vetoriais SVG a partir de formas editáveis. Retorne SOMENTE JSON válido com chave shapes.',
            'Cada shape é um objeto com: name (string), type (rect, ellipse, path ou polygon), x,y,width,height (números), fill e stroke (cores hex ou none), strokeWidth (número), rotation (número), opacity (0 a 1).',
            'Para path inclua d SVG; para polygon inclua points SVG. Coordenadas na área 512x512. Máximo de 60 formas.',
            'Nunca inclua scripts, imagens externas, foreignObject, SVG bruto ou conteúdo HTML.',
            'Respeite o estilo fornecido, as regras de perspectiva, paleta, contorno e materiais. Fundo transparente, sem retângulo de fundo.',
            'O estilo define como desenhar, e o prompt define o objeto. Não acrescente objetos não solicitados.',
            'Style JSON: ' + JSON.stringify(input.style).slice(0,18000)
          ].join('\n');
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method:'POST', headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},
            body: JSON.stringify({model:process.env.OPENAI_MODEL || 'gpt-4.1-mini', temperature:0.45, response_format:{type:'json_object'}, messages:[{role:'system',content:system},{role:'user',content:'Categoria: '+String(input.category||'custom')+'\nIlustração: '+input.prompt}]})
          });
          const result = await response.json();
          if (!response.ok) { res.statusCode = 502; res.end(JSON.stringify({error:result.error?.message || 'Falha no provedor de IA'})); return; }
          const content = result.choices?.[0]?.message?.content;
          if (typeof content !== 'string') throw new Error('Resposta vazia da IA');
          const shapes = JSON.parse(content).shapes;
          if (!Array.isArray(shapes) || shapes.length < 1 || shapes.length > 60) throw new Error('IA retornou lista de formas inválida');
          res.end(JSON.stringify({shapes}));
        } catch(e) { res.statusCode = 400; res.end(JSON.stringify({error:e instanceof Error?e.message:String(e)})); }
      });
    }
  };
}

export default defineConfig(({mode}) => {
  const env=loadEnv(mode,process.cwd(),'OPENAI_');
  process.env.OPENAI_API_KEY=process.env.OPENAI_API_KEY || env.OPENAI_API_KEY;
  process.env.OPENAI_MODEL=process.env.OPENAI_MODEL || env.OPENAI_MODEL;
  return { plugins:[react(),aiApi()], server:{port:5180,strictPort:true} };
});
