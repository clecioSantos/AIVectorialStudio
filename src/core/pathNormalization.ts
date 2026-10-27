/** Normalize SVG path geometry to absolute cubic commands for node editing.
 * Arcs (A/a) and paths with multiple subpaths are deliberately rejected;
 * converting them inaccurately would corrupt the original illustration.
 */
export function toEditableCubicPath(input:string):string|null {
  const token=/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g;
  const tokens=input.match(token)||[];
  if(!tokens.length || input.replace(token,'').replace(/[\s,]/g,'')!=='')return null;
  const count:Record<string,number>={M:2,L:2,H:1,V:1,C:6,S:4,Q:4,T:2,Z:0};
  let i=0,cmd='',x=0,y=0,sx=0,sy=0,prev='',cx=0,cy=0,qx=0,qy=0,segments=0;
  const result:string[]=[];
  const fmt=(n:number)=>Number(n.toFixed(4)).toString();
  const add=(a:number,b:number,c:number,d:number,e:number,f:number)=>{
    if(![a,b,c,d,e,f].every(Number.isFinite)||++segments>20)return false;
    result.push('C '+[a,b,c,d,e,f].map(fmt).join(' '));x=e;y=f;return true;
  };
  while(i<tokens.length){
    if(/^[a-zA-Z]$/.test(tokens[i])){cmd=tokens[i++];if(cmd==='A'||cmd==='a')return null;}
    else if(!cmd||cmd.toUpperCase()==='Z')return null;
    const type=cmd.toUpperCase(),relative=cmd!==type,n=count[type];
    if(n===undefined)return null;
    if(type==='Z'){
      if(!result.length)return null;
      if(x!==sx||y!==sy){if(!add(x+(sx-x)/3,y+(sy-y)/3,x+2*(sx-x)/3,y+2*(sy-y)/3,sx,sy))return null;}
      prev='Z';cmd='';continue;
    }
    if(i+n>tokens.length||tokens.slice(i,i+n).some(t=>/^[a-zA-Z]$/.test(t)))return null;
    const v=tokens.slice(i,i+n).map(Number);i+=n;
    if(v.some(a=>!Number.isFinite(a)))return null;
    const X=(a:number)=>relative?x+a:a,Y=(a:number)=>relative?y+a:a;
    if(type==='M'){
      if(result.length)return null;
      x=X(v[0]);y=Y(v[1]);sx=x;sy=y;result.push('M '+fmt(x)+' '+fmt(y));
      cmd=relative?'l':'L';prev='M';continue;
    }
    if(!result.length)return null;
    if(type==='L'||type==='H'||type==='V'){
      const ex=type==='V'?x:X(v[0]),ey=type==='H'?y:type==='V'?Y(v[0]):Y(v[1]);
      if(!add(x+(ex-x)/3,y+(ey-y)/3,x+2*(ex-x)/3,y+2*(ey-y)/3,ex,ey))return null;
    }else if(type==='C'){
      const ox=x,oy=y;
      if(!add(relative?ox+v[0]:v[0],relative?oy+v[1]:v[1],relative?ox+v[2]:v[2],relative?oy+v[3]:v[3],relative?ox+v[4]:v[4],relative?oy+v[5]:v[5]))return null;
      cx=relative?ox+v[2]:v[2];cy=relative?oy+v[3]:v[3];
    }else if(type==='S'){
      const ox=x,oy=y;
      const a=(prev==='C'||prev==='S')?2*x-cx:x,b=(prev==='C'||prev==='S')?2*y-cy:y;
      cx=relative?ox+v[0]:v[0];cy=relative?oy+v[1]:v[1];
      if(!add(a,b,cx,cy,relative?ox+v[2]:v[2],relative?oy+v[3]:v[3]))return null;
    }else if(type==='Q'||type==='T'){
      const ox=x,oy=y;
      qx=type==='Q'?X(v[0]):(prev==='Q'||prev==='T')?2*x-qx:x;
      qy=type==='Q'?Y(v[1]):(prev==='Q'||prev==='T')?2*y-qy:y;
      const ex=type==='Q'?X(v[2]):X(v[0]),ey=type==='Q'?Y(v[3]):Y(v[1]);
      if(!add(ox+2*(qx-ox)/3,oy+2*(qy-oy)/3,ex+2*(qx-ex)/3,ey+2*(qy-ey)/3,ex,ey))return null;
    }
    prev=type;
  }
  return segments>0?result.join(' '):null;
}
