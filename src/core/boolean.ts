import paper from 'paper';
import type {VectorShape} from './schema';

/** Paper.js operates on actual vector paths, without rasterizing the artwork. */
export type BooleanOperation='union'|'subtract'|'intersect'|'exclude';
export function combineShapes(shapes:VectorShape[],operation:BooleanOperation):VectorShape {
 if(shapes.length!==2)throw new Error('Selecione exatamente duas formas');
 const scope=new paper.PaperScope();
 scope.setup(new scope.Size(512,512));
 const convert=(s:VectorShape):paper.PathItem=>{
  let path:paper.PathItem;
  if(s.type==='rect')path=new scope.Path.Rectangle(new scope.Rectangle(s.x,s.y,s.width,s.height));
  else if(s.type==='ellipse')path=new scope.Path.Ellipse(new scope.Rectangle(s.x,s.y,s.width,s.height));
  else if(s.type==='polygon'){
   const coordinates=(s.points||'').trim().split(/[\s]+/).map(pair=>pair.split(',').map(Number));
   if(coordinates.length<3||coordinates.some(pair=>pair.length!==2||pair.some(v=>!Number.isFinite(v))))throw new Error('Polígono inválido');
   path=new scope.Path({segments:coordinates.map(([x,y])=>new scope.Point(x,y)),closed:true});
  }else{
   if(!s.d)throw new Error('Caminho SVG vazio');
   path=new scope.CompoundPath({pathData:s.d});
  }
  if(s.rotation)path.rotate(s.rotation,new scope.Point(s.x+s.width/2,s.y+s.height/2));
  return path;
 };
 try{
  const a=convert(shapes[0]),b=convert(shapes[1]);
  let result:paper.PathItem;
  if(operation==='union')result=a.unite(b,{insert:false});
  else if(operation==='subtract')result=a.subtract(b,{insert:false});
  else if(operation==='intersect')result=a.intersect(b,{insert:false});
  else result=a.exclude(b,{insert:false});
  if(!result.pathData||result.bounds.isEmpty())throw new Error('Operação produziu geometria vazia');
  const bounds=result.bounds;
  return {id:crypto.randomUUID(),name:operation+' · '+shapes[0].name+' + '+shapes[1].name,type:'path',
   x:bounds.x,y:bounds.y,width:bounds.width,height:bounds.height,
   d:result.pathData,fill:shapes[0].fill,stroke:shapes[0].stroke,
   strokeWidth:shapes[0].strokeWidth,rotation:0,opacity:shapes[0].opacity};
 }finally{scope.project.clear();}
}
