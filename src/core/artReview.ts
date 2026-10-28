import type {Artwork,StudioStyle} from './schema';
export type ArtReview={score:number;passed:boolean;issues:string[];source:'ai'|'local'};
export function localArtReview(art:Artwork):ArtReview{
 const issues:string[]=[];
 if(!art.shapes.length)issues.push('Arte sem formas');
 if(art.shapes.length<3)issues.push('Poucos elementos para avaliar o resultado');
 if(art.shapes.some(s=>![s.x,s.y,s.width,s.height].every(Number.isFinite)||s.width<0||s.height<0))issues.push('Geometria inválida');
 if(art.shapes.some(s=>s.x+s.width<0||s.y+s.height<0||s.x>512||s.y>512))issues.push('Elementos totalmente fora da área');
 const score=Math.max(0,100-issues.length*35);
 return {score,passed:score>=70,issues,source:'local'};
}
export async function reviewGeneratedArt(art:Artwork,style:StudioStyle,provider:'gemini'|'openai'):Promise<ArtReview>{
 const response=await fetch('/api/review',{method:'POST',headers:{'Content-Type':'application/json','x-vector-provider':provider},body:JSON.stringify({prompt:art.prompt,category:art.category,style,shapes:art.shapes})});
 const result:unknown=await response.json();
 if(!response.ok)throw new Error(typeof result==='object'&&result!==null&&'error'in result?String(result.error):'Falha na avaliação');
 if(!result||typeof result!=='object'||!('score'in result)||typeof result.score!=='number'||!Number.isFinite(result.score))throw new Error('Avaliação retornou formato inválido');
 const score=Math.max(0,Math.min(100,Math.round(result.score)));
 const issues='issues'in result&&Array.isArray(result.issues)?result.issues.filter((x:unknown):x is string=>typeof x==='string').slice(0,5):[];
 return {score,passed:score>=70,issues,source:'ai'};
}
