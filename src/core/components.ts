import svgpath from 'svgpath';
import type {VectorShape,StudioProject} from './schema';
import {uid} from './schema';
export type Socket={name:string;x:number;y:number};
export type VectorComponent={id:string;name:string;category?:string;tags?:string[];version?:number;shapes:VectorShape[];sockets?:Socket[]};
export type InsertOptions={x:number;y:number;scale:number;rotation:number;flipX:boolean;linked:boolean;socket?:string};
export function bounds(shapes:VectorShape[]){
 if(!shapes.length)throw new Error('Seleção vazia');
 const x=Math.min(...shapes.map(s=>s.x)),y=Math.min(...shapes.map(s=>s.y));
 return {x,y,width:Math.max(...shapes.map(s=>s.x+s.width))-x,height:Math.max(...shapes.map(s=>s.y+s.height))-y};
}
export function makeComponent(shapes:VectorShape[],name:string,category='Outros',tags:string[]=[]):VectorComponent{
 if(!shapes.length)throw new Error('Selecione uma ou mais camadas');
 return {id:uid(),name:name.trim().slice(0,80)||'Componente',category,tags:tags.map(t=>t.trim()).filter(Boolean).slice(0,12),version:1,shapes:structuredClone(shapes),sockets:[]};
}
export function instantiate(comp:VectorComponent,opts:InsertOptions):VectorShape[]{
 const b=bounds(comp.shapes),scale=Math.min(8,Math.max(.05,opts.scale));
 const center={x:opts.x,y:opts.y};
 return comp.shapes.map(shape=>{
  const map=(x:number,y:number):[number,number]=>[center.x+(x-b.x)*(opts.flipX?-scale:scale),center.y+(y-b.y)*scale];
  const x1=map(shape.x,shape.y),x2=map(shape.x+shape.width,shape.y+shape.height);
  const minX=Math.min(x1[0],x2[0]),minY=Math.min(x1[1],x2[1]);
  const next:VectorShape={...structuredClone(shape),id:uid(),x:minX,y:minY,width:Math.abs(x2[0]-x1[0]),height:Math.abs(x2[1]-x1[1]),rotation:shape.rotation+opts.rotation,
   ...(opts.linked?{componentId:comp.id,componentVersion:comp.version||1,componentSourceId:shape.id}:{}),
   strokeWidth:shape.strokeWidth*scale};
  if(shape.type==='path'&&shape.d){
   let path=svgpath(shape.d).translate(-b.x,-b.y).scale(opts.flipX?-scale:scale,scale).translate(center.x,center.y);
   next.d=path.toString();
  }
  if(shape.type==='polygon'&&shape.points){
   next.points=shape.points.trim().split(/\s+/).map(raw=>{
    const [px,py]=raw.split(',').map(Number);if(!Number.isFinite(px)||!Number.isFinite(py))throw new Error('Polígono inválido');
    return map(px,py).join(',');
   }).join(' ');
  }
  return next;
 });
}
export function syncLinkedShapes(shapes:VectorShape[],comp:VectorComponent):VectorShape[]{
 const sources=new Map(comp.shapes.map(s=>[s.id,s]));
 return shapes.map(s=>{
  if(s.componentId!==comp.id||!s.componentSourceId)return s;
  const master=sources.get(s.componentSourceId);
  if(!master)return s;
  // Linked updates keep the placement and local dimensions; update supported styling.
  return {...s,fill:master.fill,stroke:master.stroke,strokeWidth:master.strokeWidth,opacity:master.opacity,componentVersion:comp.version||1};
 });
}
export function componentPackage(components:VectorComponent[]){return {format:'aivs-components-v1',components:structuredClone(components)};}
export function validateComponentPackage(value:unknown):VectorComponent[]{
 if(!value||typeof value!=='object')throw new Error('Pacote inválido');
 const o=value as Record<string,unknown>;
 if(o.format!=='aivs-components-v1'||!Array.isArray(o.components)||o.components.length>300)throw new Error('Formato de pacote inválido');
 return o.components.map((raw:unknown)=>{
  if(!raw||typeof raw!=='object')throw new Error('Componente inválido');
  const c=raw as Record<string,unknown>;
  if(typeof c.name!=='string'||!Array.isArray(c.shapes)||c.shapes.length>100||!c.shapes.length)throw new Error('Camadas inválidas');
  const shapes=c.shapes.map((item:unknown)=>{
   if(!item||typeof item!=='object')throw new Error('Forma inválida');
   const s=item as VectorShape;
   if(!['rect','ellipse','path','polygon'].includes(s.type)||![s.x,s.y,s.width,s.height,s.rotation,s.opacity,s.strokeWidth].every(Number.isFinite))throw new Error('Geometria inválida');
   return {...structuredClone(s),id:uid()};
  });
  return {id:uid(),name:c.name.slice(0,80),category:typeof c.category==='string'?c.category.slice(0,60):'Outros',tags:Array.isArray(c.tags)?c.tags.filter((s:unknown)=>typeof s==='string').slice(0,12):[],version:1,shapes,sockets:[]};
 });
}
export function componentHints(project:StudioProject):string{
 return project.components.slice(0,12).map(c=>c.name+' ['+(c.category||'Outros')+']').join('; ').slice(0,600);
}
