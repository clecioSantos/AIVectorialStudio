/** Edição visual segura de paths SVG com M inicial e segmentos C absolutos. */
export type BezierPoint={x:number;y:number;kind:'anchor'|'control'};
export function parseBezier(d:string):BezierPoint[]|null{
 const tokens=d.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g)||[];
 if(tokens.length<9||tokens[0]!=='M')return null;
 let i=1;const n=()=>{const v=Number(tokens[i++]);return Number.isFinite(v)?v:NaN};
 const start={x:n(),y:n(),kind:'anchor' as const};
 if(!Number.isFinite(start.x)||!Number.isFinite(start.y))return null;
 const out:BezierPoint[]=[start];
 while(i<tokens.length){
  if(tokens[i++]!=='C')return null;
  const data=[n(),n(),n(),n(),n(),n()];
  if(data.some(v=>!Number.isFinite(v)))return null;
  out.push({x:data[0],y:data[1],kind:'control'},{x:data[2],y:data[3],kind:'control'},{x:data[4],y:data[5],kind:'anchor'});
 }
 return out.length>1&&out.length<=61?out:null;
}
export function serializeBezier(points:BezierPoint[]):string{
 if((points.length-1)%3!==0)throw new Error('Curva inválida');
 const f=(v:number)=>Number(v.toFixed(2));
 let d='M '+f(points[0].x)+' '+f(points[0].y);
 for(let i=1;i<points.length;i+=3)d+=' C '+[points[i].x,points[i].y,points[i+1].x,points[i+1].y,points[i+2].x,points[i+2].y].map(f).join(' ');
 return d;
}
export function moveBezierPoint(points:BezierPoint[],index:number,x:number,y:number):BezierPoint[]{
 const next=points.map(p=>({...p}));if(!next[index])return next;
 const dx=x-next[index].x,dy=y-next[index].y;
 next[index]={...next[index],x,y};
 if(next[index].kind==='anchor'){
  if(index>0&&next[index-1]?.kind==='control'){next[index-1].x+=dx;next[index-1].y+=dy;}
  if(index+1<next.length&&next[index+1]?.kind==='control'){next[index+1].x+=dx;next[index+1].y+=dy;}
 }
 return next;
}
