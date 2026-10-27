import {Artwork,StudioStyle,VectorShape,now,uid} from './schema';
const shape=(name:string,type:VectorShape['type'],x:number,y:number,width:number,height:number,fill:string,style:StudioStyle,extra:Partial<VectorShape>={}):VectorShape=>({id:uid(),name,type,x,y,width,height,fill,stroke:style.outlines.enabled?style.outlines.color:'none',strokeWidth:style.outlines.width*(1+(style.outlines.variation||0)*.15),rotation:0,opacity:1,radius:Math.round(((style.outlines.roundness||0)+(1-(style.geometry.edgeSharpness??.5))*.3)*10),strokeLineCap:style.outlines.lineCap||style.outlines.cap||'round',strokeLineJoin:style.outlines.lineJoin||'round',...extra});
export interface GenerationProvider {id:string;label:string;generate(input:{prompt:string;style:StudioStyle;category:string;json?:unknown}):Promise<VectorShape[]>}
function demoShapes(prompt:string,s:StudioStyle):VectorShape[]{const p=prompt.toLowerCase();const metal=s.materials.iron||s.materials.metal||Object.values(s.materials)[0];const wood=s.materials.wood||Object.values(s.materials)[0];const gold=s.materials.gold||Object.values(s.materials)[0];const primary=s.palette.primary[0];const dark=s.palette.shadow;const accent=s.palette.accent?.[0]||s.palette.highlight;const detail=(s.geometry.detailDensity??s.geometry.detailComplexity??s.artDirection.detailLevel);const strength=s.lighting.highlightIntensity??s.lighting.intensity;const ambient=s.lighting.ambientOcclusion??.3;const lit=s.palette.lighting;const lightColor=Array.isArray(lit)?(lit[0]||s.palette.highlight):(lit||s.palette.highlight);const reflect=(m:typeof metal)=>m.reflectivity??m.metallic??.25;const o=(n:string,t:VectorShape['type'],x:number,y:number,w:number,h:number,f:string,e:Partial<VectorShape>={})=>shape(n,t,x,y,w,h,f,s,e);
if(/espada|sword|lâmina|blade/.test(p))return [o('Sombra da lâmina','polygon',217,65,78,260,metal.shadow,{points:'256,65 274,111 264,320 245,320 238,111'}),o('Lâmina','polygon',224,61,64,255,metal.base,{points:'256,61 281,108 264,314 248,314 231,108'}),o('Brilho','polygon',247,76,26,226,lightColor,{points:'256,76 261,112 260,296 250,304 251,108',stroke:'none',opacity:Math.min(1,.35+strength*.55+reflect(metal)*.2)}),o('Guarda','rect',180,306,152,24,gold.base,{rotation:0}),o('Cabo','rect',243,326,26,113,wood.base),o('Detalhe do cabo','rect',250,335,12,94,wood.highlight,{stroke:'none'}),o('Pomo','ellipse',238,426,37,37,gold.highlight),...(detail>.58?[o('Guarda ornamental','rect',206,313,100,6,accent,{stroke:'none'})]:[])];
if(/escudo|shield/.test(p))return [o('Sombra escudo','polygon',116,80,280,340,dark,{points:'256,80 395,126 373,306 256,420 139,306 116,126'}),o('Escudo principal','polygon',130,89,252,316,wood.base,{points:'256,89 381,136 361,297 256,405 151,297 130,136'}),o('Revestimento','polygon',151,111,210,264,primary,{points:'256,111 361,151 343,286 256,375 169,286 151,151'}),o('Faixa vertical','rect',242,111,28,263,gold.base),o('Emblema','ellipse',212,213,88,88,gold.highlight)];
if(/poção|pocao|potion|frasco|bottle/.test(p))return [o('Tampa','rect',217,86,78,39,wood.base),o('Gargalo','rect',225,121,62,63,metal.highlight),o('Vidro','path',120,172,272,265,'#9BC9CE',{d:'M 225 173 L 287 173 C 306 193 373 223 385 278 C 407 368 338 438 256 438 C 173 438 105 368 127 278 C 140 223 207 193 225 173 Z',opacity:.84}),o('Líquido','path',151,269,210,149,s.palette.secondary[0]||primary,{d:'M 152 283 Q 256 259 360 283 C 380 347 329 418 256 418 C 184 418 133 347 152 283 Z',stroke:'none'}),o('Reflexo','ellipse',175,216,29,112,'#FFFFFF',{stroke:'none',opacity:.6})];
if(/machado|axe|picareta|pickaxe/.test(p))return [o('Cabo','rect',246,100,31,340,wood.base,{rotation:12}),o('Madeira iluminada','rect',253,120,11,300,wood.highlight,{stroke:'none',rotation:12}),o('Cabeça de metal','path',113,74,291,200,metal.base,{d:'M 220 116 C 149 112 124 83 113 74 Q 94 178 152 251 Q 183 190 239 182 Q 294 196 348 251 Q 405 178 399 74 Q 331 128 277 116 Z'}),o('Fio esquerdo','path',112,82,59,160,metal.highlight,{d:'M 114 82 Q 109 176 153 241 Q 121 166 114 82 Z',stroke:'none'})];
if(/estrela|star|ícone|icone|icon/.test(p))return [o('Emblema','polygon',102,81,308,327,primary,{points:'256,81 296,189 410,192 319,262 352,376 256,309 160,376 193,262 102,192 216,189'}),o('Centro','ellipse',218,215,76,76,accent,{stroke:'none'}),...(detail>.65?[o('Brilho central','ellipse',237,234,38,38,lightColor,{stroke:'none',opacity:strength})]:[])];
return [o('Sombra','ellipse',121,364,276,58,dark,{opacity:.08+ambient*.35,stroke:'none'}),o('Corpo','rect',146,149,220,215,primary),o('Topo','path',145,89,222,130,s.palette.primary[1]||primary,{d:'M 145 182 L 184 100 Q 256 58 328 100 L 367 182 Z'}),o('Ornamento','ellipse',211,190,90,90,accent),o('Base','rect',130,347,252,39,s.palette.secondary[0]||primary),...(detail>.65?[o('Iluminação','ellipse',238,216,40,40,lightColor,{stroke:'none',opacity:Math.min(.8,strength*.65)})]:[])];}
export const localProvider:GenerationProvider={id:'local-demo',label:'Gerador vetorial local (demonstração)',async generate({prompt,style,json}){if(json){const source=typeof json==='object'&&json!==null?json:{};const list=Array.isArray(source)?source:('shapes'in source?(source as {shapes:unknown}).shapes:[]);if(!Array.isArray(list))throw new Error('JSON deve conter uma lista "shapes".');return list.map((v,i)=>{if(!v||typeof v!=='object')throw new Error(`Forma ${i} inválida`);const e=v as Record<string,unknown>;const type=e.type;if(!['rect','ellipse','path','polygon'].includes(String(type)))throw new Error(`Tipo inválido na forma ${i}`);const base=shape(String(e.name||`Forma ${i+1}`),type as VectorShape['type'],Number(e.x||0),Number(e.y||0),Number(e.width||100),Number(e.height||100),String(e.fill||style.palette.primary[0]),style);return {...base,...e,id:uid(),type:base.type} as VectorShape;});}return demoShapes(prompt,style);}};
export async function createArtwork(name:string,prompt:string,category:string,style:StudioStyle,json?:unknown):Promise<Artwork>{const shapes=await localProvider.generate({prompt,style,category,json});return {id:uid(),name,prompt,category,createdAt:now(),modifiedAt:now(),size:style.export.defaultSize,shapes,stylePatch:{}};}

function validateAiShapes(payload:unknown,style:StudioStyle):VectorShape[]{
 const result=payload;
 if(typeof result!=='object'||result===null||!('shapes'in result)||!Array.isArray(result.shapes))throw new Error('Resposta de IA inválida');
 const items=result.shapes as unknown[];
 if(items.length<1||items.length>60)throw new Error('Número de camadas inválido');
 const color=/^(#[0-9a-fA-F]{6}|none)$/;
 const number=(v:unknown,defaultValue:number,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max?v:defaultValue;
 return items.map((v,i):VectorShape=>{
  if(!v||typeof v!=='object')throw new Error('Camada '+i+' inválida');
  const s=v as Record<string,unknown>;
  if(!['rect','ellipse','path','polygon'].includes(String(s.type)))throw new Error('Tipo de camada inválido');
  const type=s.type as VectorShape['type'];
  const fill=typeof s.fill==='string'&&color.test(s.fill)?s.fill:style.palette.primary[0];
  const stroke=typeof s.stroke==='string'&&color.test(s.stroke)?s.stroke:(style.outlines.enabled?style.outlines.color:'none');
  const d=typeof s.d==='string'&&s.d.length<=10000&&/^[MmLlHhVvCcSsQqTtAaZz0-9.,\s+\-eE]*$/.test(s.d)?s.d:undefined;
  const points=typeof s.points==='string'&&s.points.length<=10000&&/^[0-9.,\s+\-eE]*$/.test(s.points)?s.points:undefined;
  if(type==='path'&&!d)throw new Error('Caminho SVG inválido na camada '+i);
  if(type==='polygon'&&!points)throw new Error('Polígono inválido na camada '+i);
  return {id:uid(),name:typeof s.name==='string'?s.name.slice(0,80):'Camada '+(i+1),type,
   x:number(s.x,0,-1024,1024),y:number(s.y,0,-1024,1024),width:number(s.width,100,0,2048),height:number(s.height,100,0,2048),
   fill,stroke,strokeWidth:number(s.strokeWidth,style.outlines.width,0,40),rotation:number(s.rotation,0,-360,360),opacity:number(s.opacity,1,0,1),
   ...(d?{d}:{}),...(points?{points}:{})};
 });
}

/** IA remota via servidor local. A chave nunca é enviada ao navegador. */
export const aiProvider:GenerationProvider={id:'openai',label:'OpenAI (SVG editável)',async generate({prompt,style,category}){
 const response=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json','x-vector-provider':'openai'},body:JSON.stringify({prompt,style,category})});
 const result:unknown=await response.json();
 if(!response.ok)throw new Error(typeof result==='object'&&result!==null&&'error'in result?String(result.error):'Falha na geração com IA');
 return validateAiShapes(result,style);
}};
export const geminiProvider:GenerationProvider={...aiProvider,id:'gemini',label:'Google Gemini (SVG editável)',async generate(input){
 const response=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json','x-vector-provider':'gemini'},body:JSON.stringify(input)});
 const result:unknown=await response.json();
 if(!response.ok)throw new Error(typeof result==='object'&&result!==null&&'error'in result?String(result.error):'Falha na API Gemini');
 return validateAiShapes(result,input.style);
}};
export type GeneratorId='local-demo'|'openai'|'gemini';
export async function createArtworkWithProvider(name:string,prompt:string,category:string,style:StudioStyle,provider:GeneratorId,json?:unknown):Promise<Artwork>{
 const shapes=await (provider==='gemini'?geminiProvider:provider==='openai'?aiProvider:localProvider).generate({prompt,style,category,json});
 return {id:uid(),name,prompt,category,createdAt:now(),modifiedAt:now(),size:style.export.defaultSize,shapes,stylePatch:{}};
}

export type EditChange={id:string;patch:Partial<VectorShape>};
export type EditProposal={artworkId:string;changes:EditChange[];summary:string};
export async function proposeArtworkEdit(art:Artwork,instruction:string,style:StudioStyle,provider:'gemini'|'openai',selectedId?:string|null):Promise<EditProposal>{
 if(!instruction.trim())throw new Error('Informe a alteração desejada');
 const response=await fetch('/api/edit',{method:'POST',headers:{'Content-Type':'application/json','x-vector-provider':provider},body:JSON.stringify({instruction,style,shapes:art.shapes,selectedId:selectedId||null})});
 const payload:unknown=await response.json();
 if(!response.ok)throw new Error(typeof payload==='object'&&payload!==null&&'error' in payload?String(payload.error):'Falha ao editar arte');
 if(!payload||typeof payload!=='object'||!('changes' in payload)||!Array.isArray(payload.changes))throw new Error('Resposta de edição inválida');
 const allowed=new Set(selectedId?[selectedId]:art.shapes.map(s=>s.id));
 const numeric=new Set(['x','y','width','height','rotation','strokeWidth','opacity','radius']);
 const colors=new Set(['fill','stroke']);
 const textFields=new Set(['name','d','points']);
 const changes:EditChange[]=[];
 for(const item of payload.changes){
  if(!item||typeof item!=='object'||typeof item.id!=='string'||!allowed.has(item.id)||typeof item.patch!=='object'||!item.patch)throw new Error('IA tentou alterar camada não autorizada');
  const patch:Record<string,unknown>={};
  for(const [key,value] of Object.entries(item.patch as Record<string,unknown>)){
   if(numeric.has(key)){if(typeof value!=='number'||!Number.isFinite(value)||Math.abs(value)>3000)throw new Error('Valor numérico inválido');patch[key]=value;}
   else if(colors.has(key)){if(typeof value!=='string'||!/^#[0-9a-fA-F]{6}$|^none$/.test(value))throw new Error('Cor inválida');patch[key]=value;}
   else if(textFields.has(key)){if(typeof value!=='string'||value.length>8000)throw new Error('Texto de forma inválido');patch[key]=value;}
   else if(key==='strokeLineCap'&&['butt','round','square'].includes(String(value)))patch[key]=value;
   else if(key==='strokeLineJoin'&&['bevel','round','miter'].includes(String(value)))patch[key]=value;
   else throw new Error('Campo de edição não permitido: '+key);
  }
  changes.push({id:item.id,patch:patch as Partial<VectorShape>});
 }
 if(!changes.length)throw new Error('A IA não sugeriu alterações');
 return {artworkId:art.id,changes,summary:typeof payload.summary==='string'?payload.summary.slice(0,400):'Alterações propostas'};
}
export function applyEditProposal(art:Artwork,proposal:EditProposal):Artwork{
 if(art.id!==proposal.artworkId)throw new Error('Prévia pertence a outra ilustração');
 const changes=new Map(proposal.changes.map(x=>[x.id,x.patch]));
 return {...art,modifiedAt:now(),shapes:art.shapes.map(s=>changes.has(s.id)?{...s,...changes.get(s.id)}:s)};
}
