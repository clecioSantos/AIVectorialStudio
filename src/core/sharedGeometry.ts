import type {Artwork,StudioStyle,VectorShape} from './schema';
import {uid,now} from './schema';
import {defaultMaterials} from './assetBatch';
import type {CollectionEntry,Rarity} from './collectionTemplates';
type Role='base'|'highlight'|'shadow'|'other';
const rarityStrength:Record<Rarity,number>={'Comum':0,'Incomum':0.12,'Raro':0.25,'Épico':0.38,'Lendário':0.5};
const hex=(v:string)=>/^#[0-9a-fA-F]{6}$/.test(v);
const rgb=(v:string)=>[1,3,5].map(i=>parseInt(v.slice(i,i+2),16));
const toHex=(c:number[])=>'#'+c.map(v=>Math.min(255,Math.max(0,Math.round(v))).toString(16).padStart(2,'0')).join('').toUpperCase();
const mix=(a:string,b:string,t:number)=>hex(a)&&hex(b)?toHex(rgb(a).map((v,i)=>v*(1-t)+rgb(b)[i]*t)):a;
const dist=(a:string,b:string)=>hex(a)&&hex(b)?Math.sqrt(rgb(a).reduce((sum,n,i)=>sum+(n-rgb(b)[i])**2,0)):Infinity;
export function createSharedGeometryVariant(base:Artwork,style:StudioStyle,entry:CollectionEntry):Artwork{
 const material=defaultMaterials.find(m=>m.name===entry.material);
 if(!material)throw new Error('Material não encontrado');
 if(!base.shapes.length)throw new Error('Modelo-base sem camadas');
 const roles:{color:string;role:Role}[]=[
  ...style.palette.primary.map(color=>({color,role:'base' as Role})),
  {color:style.palette.highlight,role:'highlight'},
  {color:style.palette.shadow,role:'shadow'}
 ];
 const strength=rarityStrength[entry.rarity];
 const remap=(color:string)=>{
  if(!hex(color))return color;
  const best=roles.reduce((a,b)=>dist(color,a.color)<dist(color,b.color)?a:b);
  if(dist(color,best.color)>0)return color; // preserve other components such as wooden handles
  if(best.role==='highlight')return mix(material.highlight,'#FFFFFF',strength*.35);
  if(best.role==='shadow')return material.shadow;
  return mix(material.base,material.highlight,strength*.2);
 };
 const shapes:VectorShape[]=base.shapes.map(shape=>({
  ...structuredClone(shape),id:uid(),
  fill:remap(shape.fill),stroke:remap(shape.stroke),
  strokeWidth:shape.strokeWidth,
  opacity:shape.opacity
 }));
 return {...structuredClone(base),id:uid(),name:entry.name,category:entry.category,prompt:entry.prompt,createdAt:now(),modifiedAt:now(),shapes};
}
