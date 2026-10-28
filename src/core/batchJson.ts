import type {GeneratorId} from './generator';
export type BatchAsset={id:string;name:string;prompt:string;category:string;provider:GeneratorId;advanced:boolean;detailLimit:number;review:boolean;referenceImages:string[]};
export type BatchConfig={assets:BatchAsset[];stopOnError:boolean};
const providers=['local-demo','openai','gemini'] as const;
const categories=['weapons','items','icons','characters','environment','custom'] as const;
const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
export function parseBatchJson(text:string,defaults:{provider:GeneratorId;category:string;advanced:boolean;detailLimit:number}):BatchConfig{
 let input:unknown;try{input=JSON.parse(text)}catch(e){throw new Error('JSON inválido: '+(e instanceof Error?e.message:String(e)))}
 if(!record(input)||input.schemaVersion!=='1.0'||!Array.isArray(input.assets))throw new Error('Esperado objeto com schemaVersion "1.0" e array assets');
 if(input.assets.length<1||input.assets.length>100)throw new Error('Inclua entre 1 e 100 assets por lote');
 const options=record(input.defaults)?input.defaults:{};
 const choose=(a:Record<string,unknown>,k:string)=>a[k]===undefined?options[k]:a[k];
 const assets=input.assets.map((v:unknown,i:number):BatchAsset=>{
  if(!record(v))throw new Error('Asset '+(i+1)+': deve ser objeto');
  const name=v.name,prompt=v.prompt;
  if(typeof name!=='string'||!name.trim()||name.length>120)throw new Error('Asset '+(i+1)+': name obrigatório, até 120 caracteres');
  if(typeof prompt!=='string'||prompt.trim().length<3||prompt.length>3000)throw new Error('Asset '+(i+1)+': prompt deve ter 3 a 3000 caracteres');
  const provider=choose(v,'provider')??defaults.provider;
  if(typeof provider!=='string'||!providers.includes(provider as GeneratorId))throw new Error('Asset '+(i+1)+': provider inválido');
  const category=choose(v,'category')??defaults.category;
  if(typeof category!=='string'||!categories.includes(category as typeof categories[number]))throw new Error('Asset '+(i+1)+': category inválida');
  const advanced=choose(v,'advanced')??defaults.advanced;
  if(typeof advanced!=='boolean')throw new Error('Asset '+(i+1)+': advanced deve ser booleano');
  const detailLimit=choose(v,'detailLimit')??defaults.detailLimit;
  if(!Number.isInteger(detailLimit)||Number(detailLimit)<1||Number(detailLimit)>1000)throw new Error('Asset '+(i+1)+': detailLimit deve ser inteiro entre 1 e 1000');
  const review=choose(v,'review')??true;
  if(typeof review!=='boolean')throw new Error('Asset '+(i+1)+': review deve ser booleano');
  const refs=choose(v,'referenceImages')??[];
  if(!Array.isArray(refs)||refs.length>3||refs.some(x=>typeof x!=='string'||x.length>700000||!/^data:image\/(png|jpeg|webp);base64,/.test(x)))throw new Error('Asset '+(i+1)+': referenceImages deve ter até 3 imagens em data URL');
  return{id:typeof v.id==='string'&&v.id.trim()?v.id:String(i+1),name:name.trim(),prompt:prompt.trim(),category,provider:provider as GeneratorId,advanced,detailLimit:Number(detailLimit),review,referenceImages:refs};
 });
 if(new Set(assets.map(x=>x.id)).size!==assets.length)throw new Error('IDs de assets duplicados');
 const stopOnError=input.stopOnError??false;if(typeof stopOnError!=='boolean')throw new Error('stopOnError deve ser booleano');
 return{assets,stopOnError};
}
export const batchTemplate={schemaVersion:'1.0',stopOnError:false,defaults:{provider:'gemini',category:'items',advanced:true,detailLimit:150,review:true},assets:[{id:'forja',name:'Forja medieval',prompt:'Uma forja medieval de pedras, brasas acesas e ferramentas, mantendo o estilo do projeto',category:'environment',detailLimit:220},{id:'bigorna',name:'Bigorna de ferro',prompt:'Uma bigorna medieval sobre um cepo de madeira, vista de frente em SVG editável',category:'items',detailLimit:120}]};
