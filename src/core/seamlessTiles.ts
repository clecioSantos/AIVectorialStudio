import type {Artwork,VectorShape} from './schema';
import {serializeSvg,downloadBlob} from './export';
export type TileAxis='horizontal'|'vertical'|'both';
export type TileOptions={size:number;axis:TileAxis;repeats:number};
export type SeamIssue={shape:string;reason:string};
export function validateTile(options:TileOptions):void{
 if(!Number.isInteger(options.size)||options.size<16||options.size>512)throw new Error('Tile deve ter entre 16 e 512 unidades');
 if(!Number.isInteger(options.repeats)||options.repeats<2||options.repeats>20)throw new Error('Repetições devem estar entre 2 e 20');
}
export function tileIssues(shapes:VectorShape[],size=512,axis:TileAxis='horizontal'):SeamIssue[]{
 const warnings:SeamIssue[]=[];
 for(const s of shapes){
  if(s.stroke!=='none'&&s.strokeWidth>0&&(s.x<=0||s.y<=0||s.x+s.width>=size||s.y+s.height>=size)){
   warnings.push({shape:s.name,reason:'Contorno na borda pode criar linhas de junção'});
  }
  if((axis==='horizontal'||axis==='both')&&(s.x<0||s.x+s.width>size))warnings.push({shape:s.name,reason:'Forma cruza a borda horizontal; conferir continuidade'});
  if((axis==='vertical'||axis==='both')&&(s.y<0||s.y+s.height>size))warnings.push({shape:s.name,reason:'Forma cruza a borda vertical; conferir continuidade'});
 }
 return warnings;
}
export function tilePreviewSvg(art:Artwork,options:TileOptions):string{
 validateTile(options);
 const {size,axis,repeats}=options;
 const cols=axis==='vertical'?1:repeats,rows=axis==='horizontal'?1:repeats;
 // Each instance carries its own clip to prevent overflow from neighboring tiles.
 const parts=Array.from({length:cols*rows},(_,i)=>{
  const x=i%cols*size,y=Math.floor(i/cols)*size;
  const body=serializeSvg(art,true).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
  return '<svg x="'+x+'" y="'+y+'" width="'+size+'" height="'+size+'" viewBox="0 0 512 512" overflow="hidden">'+body+'</svg>';
 });
 return '<svg xmlns="http://www.w3.org/2000/svg" width="'+cols*size+'" height="'+rows*size+'" viewBox="0 0 '+cols*size+' '+rows*size+'">'+parts.join('')+'</svg>';
}
export function exportTilePreview(art:Artwork,options:TileOptions):void{
 const svg=tilePreviewSvg(art,options);
 downloadBlob(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),'tile-repeat-preview.svg');
}
