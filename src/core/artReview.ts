import type {Artwork,StudioStyle} from './schema';
import {serializeSvg} from './export';
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
export async function renderReviewPng(art:Artwork):Promise<string>{
 const image=new Image();const url=URL.createObjectURL(new Blob([serializeSvg(art,true)],{type:'image/svg+xml;charset=utf-8'}));
 try{await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('Não foi possível rasterizar o SVG para avaliação'));image.src=url;});const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas indisponível');ctx.clearRect(0,0,256,256);ctx.drawImage(image,0,0,256,256);return canvas.toDataURL('image/png');}finally{URL.revokeObjectURL(url)}
}
export async function reviewGeneratedArt(art:Artwork,style:StudioStyle,provider:'gemini'|'openai',visual=false):Promise<ArtReview>{
 const render=visual?await renderReviewPng(art):undefined;
 const response=await fetch('/api/review',{method:'POST',headers:{'Content-Type':'application/json','x-vector-provider':provider},body:JSON.stringify({prompt:art.prompt,category:art.category,style,shapes:art.shapes,render})});
 const result:unknown=await response.json();
 if(!response.ok)throw new Error(typeof result==='object'&&result!==null&&'error'in result?String(result.error):'Falha na avaliação');
 if(!result||typeof result!=='object'||!('score'in result)||typeof result.score!=='number'||!Number.isFinite(result.score))throw new Error('Avaliação retornou formato inválido');
 const score=Math.max(0,Math.min(100,Math.round(result.score)));
 const issues='issues'in result&&Array.isArray(result.issues)?result.issues.filter((x:unknown):x is string=>typeof x==='string').slice(0,5):[];
 return {score,passed:score>=70,issues,source:'ai'};
}
