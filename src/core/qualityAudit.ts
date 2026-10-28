import type {Artwork,StudioStyle} from './schema';
export type QualityIssue={kind:'palette'|'detail'|'stroke'|'perspective';message:string};
const hex=(s:string)=>/^#[0-9a-f]{6}$/i.test(s);
const rgb=(s:string)=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));
const distance=(a:string,b:string)=>Math.sqrt(rgb(a).reduce((sum,v,i)=>sum+(v-rgb(b)[i])**2,0));
export function auditStyleConsistency(art:Artwork,style:StudioStyle,references:Artwork[]=[]):QualityIssue[]{
 const issues:QualityIssue[]=[];
 const colors=[...style.palette.primary,...style.palette.secondary,...(style.palette.accent||[]),style.palette.highlight,style.palette.shadow,...Object.values(style.materials).flatMap(m=>[m.base,m.highlight,m.shadow])].filter(hex);
 const used=[...new Set(art.shapes.flatMap(s=>[s.fill,s.stroke]).filter(hex))];
 const outliers=used.filter(c=>colors.every(ref=>distance(c,ref)>105));
 if(outliers.length>Math.max(2,Math.floor(used.length*.65)))issues.push({kind:'palette',message:'Muitas cores estão distantes da paleta e dos materiais do projeto'});
 const refs=references.filter(a=>a.id!==art.id&&a.category===art.category&&a.shapes.length);
 if(refs.length){
  const avg=refs.reduce((sum,a)=>sum+a.shapes.length,0)/refs.length;
  if(art.shapes.length>avg*2.8&&art.shapes.length>12)issues.push({kind:'detail',message:'Quantidade de camadas muito acima da média da categoria'});
  const strokes=refs.flatMap(a=>a.shapes.filter(s=>s.stroke!=='none').map(s=>s.strokeWidth));
  const target=strokes.reduce((sum,x)=>sum+x,0)/(strokes.length||1);
  const actual=art.shapes.filter(s=>s.stroke!=='none').map(s=>s.strokeWidth);
  const mean=actual.reduce((sum,x)=>sum+x,0)/(actual.length||1);
  if(strokes.length&&actual.length&&Math.abs(mean-target)>Math.max(4,target*1.2))issues.push({kind:'stroke',message:'Espessura média dos contornos diverge das referências'});
 }
 return issues;
}
