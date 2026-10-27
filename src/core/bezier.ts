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

export function addBezierNode(points:BezierPoint[],segment:number):BezierPoint[]{
 if(segment<0||segment*3+3>=points.length)return points;
 const k=segment*3,a=points[k],b=points[k+1],c=points[k+2],d=points[k+3];
 const mid=(u:BezierPoint,v:BezierPoint):BezierPoint=>({x:(u.x+v.x)/2,y:(u.y+v.y)/2,kind:'control'});
 const ab=mid(a,b),bc=mid(b,c),cd=mid(c,d),abc=mid(ab,bc),bcd=mid(bc,cd),center=mid(abc,bcd);
 return [...points.slice(0,k+1),ab,abc,{...center,kind:'anchor'},bcd,cd,...points.slice(k+3)];
}
export function removeBezierAnchor(points:BezierPoint[],index:number):BezierPoint[]{
 if(index%3!==0||points.length<=4||index<0||index>=points.length)return points;
 if(index===0)return [{...points[3],kind:'anchor'},...points.slice(4)];
 if(index===points.length-1)return points.slice(0,index-2);
 return [...points.slice(0,index-1),...points.slice(index+2)];
}
export function setBezierSmooth(points:BezierPoint[],index:number,smooth:boolean):BezierPoint[]{
 const next=points.map(p=>({...p}));
 if(index<=0||index>=next.length-1||index%3!==0)return next;
 const anchor=next[index],incoming=next[index-1],outgoing=next[index+1];
 if(smooth){const length=Math.hypot(outgoing.x-anchor.x,outgoing.y-anchor.y)||30;const dx=anchor.x-incoming.x,dy=anchor.y-incoming.y,norm=Math.hypot(dx,dy)||1;outgoing.x=anchor.x+dx/norm*length;outgoing.y=anchor.y+dy/norm*length;}
 return next;
}
export function moveBezierPointLinked(points:BezierPoint[],index:number,x:number,y:number,mirror:boolean):BezierPoint[]{
 const next=moveBezierPoint(points,index,x,y);
 if(!mirror||next[index]?.kind!=='control')return next;
 const anchorIndex=index%3===1?index-1:index+1;
 const otherIndex=index%3===1?anchorIndex-1:anchorIndex+1;
 const anchor=next[anchorIndex],other=next[otherIndex];
 if(anchor&&other){const length=Math.hypot(other.x-anchor.x,other.y-anchor.y);const dx=anchor.x-x,dy=anchor.y-y,norm=Math.hypot(dx,dy)||1;other.x=anchor.x+dx/norm*length;other.y=anchor.y+dy/norm*length;}
 return next;
}
export function closeBezier(points:BezierPoint[]):BezierPoint[]{
 if(points.length<4)return points;
 const first=points[0],last=points[points.length-1];
 if(Math.hypot(last.x-first.x,last.y-first.y)<0.01)return points;
 const a={x:last.x+(first.x-last.x)/3,y:last.y+(first.y-last.y)/3,kind:'control' as const};
 const b={x:last.x+2*(first.x-last.x)/3,y:last.y+2*(first.y-last.y)/3,kind:'control' as const};
 return [...points,a,b,{...first}];
}
