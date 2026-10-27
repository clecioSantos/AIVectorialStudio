import type {Artwork} from './schema';
import {serializeSvg,downloadBlob} from './export';
import {planAtlas} from './assetBatch';

async function renderSvg(art:Artwork,size:number):Promise<HTMLImageElement>{
 const svg=serializeSvg(art,true);
 const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
 const img=new Image();
 try{
  await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(new Error('Falha ao renderizar '+art.name));img.src=url;});
  return img;
 }finally{URL.revokeObjectURL(url);}
}
export async function exportAtlas(artworks:Artwork[],cellSize=256,columns=4,padding=2):Promise<void>{
 const plan=planAtlas(artworks,cellSize,columns,padding);
 const canvas=document.createElement('canvas');canvas.width=plan.width;canvas.height=plan.height;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas indisponível');
 ctx.clearRect(0,0,plan.width,plan.height);
 for(let i=0;i<artworks.length;i++){
  const image=await renderSvg(artworks[i],cellSize),cell=plan.cells[i];
  ctx.drawImage(image,cell.x,cell.y,cell.width,cell.height);
 }
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Falha ao exportar atlas')),'image/png'));
 downloadBlob(blob,'vector-atlas.png');
 const manifest={format:'ai-vectorial-studio-atlas-v1',image:'vector-atlas.png',width:plan.width,height:plan.height,transparent:true,cellSize,padding,columns,frames:plan.cells.map((cell,index)=>({...cell,index,pivot:{x:0.5,y:0.5}}))};
 downloadBlob(new Blob([JSON.stringify(manifest,null,2)],{type:'application/json'}),'vector-atlas.json');
}
