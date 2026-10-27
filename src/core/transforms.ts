import svgpath from 'svgpath';
import type {VectorShape} from './schema';

function mapPolygon(points:string,fn:(x:number,y:number)=>[number,number]):string{
 const items=points.trim().split(/[\s]+/);
 if(!items.length)throw new Error('Polígono vazio');
 return items.map(raw=>{
  const xy=raw.split(',').map(Number);
  if(xy.length!==2||xy.some(v=>!Number.isFinite(v)))throw new Error('Ponto inválido');
  return fn(xy[0],xy[1]).map(v=>Number(v.toFixed(3))).join(',');
 }).join(' ');
}
export function translateShape(sh:VectorShape,dx:number,dy:number):VectorShape{
 if(!Number.isFinite(dx)||!Number.isFinite(dy))return sh;
 return {...sh,x:sh.x+dx,y:sh.y+dy,
  ...(sh.type==='path'&&sh.d?{d:svgpath(sh.d).translate(dx,dy).toString()}:{}),
  ...(sh.type==='polygon'&&sh.points?{points:mapPolygon(sh.points,(x,y)=>[x+dx,y+dy])}:{})};
}
export function resizeShape(sh:VectorShape,w:number,h:number):VectorShape{
 const width=Math.max(1,Math.min(2048,w)),height=Math.max(1,Math.min(2048,h));
 const fx=width/(sh.width||1),fy=height/(sh.height||1);
 if(!Number.isFinite(fx)||!Number.isFinite(fy))return sh;
 return {...sh,width,height,
  ...(sh.type==='path'&&sh.d?{d:svgpath(sh.d).translate(-sh.x,-sh.y).scale(fx,fy).translate(sh.x,sh.y).toString()}:{}),
  ...(sh.type==='polygon'&&sh.points?{points:mapPolygon(sh.points,(x,y)=>[sh.x+(x-sh.x)*fx,sh.y+(y-sh.y)*fy])}:{})};
}
export function rotateShape(sh:VectorShape,degrees:number):VectorShape{
 return {...sh,rotation:((degrees%360)+360)%360};
}
