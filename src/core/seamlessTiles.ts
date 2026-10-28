import type {Artwork,VectorShape} from './schema';
import {shapeMarkup,downloadBlob} from './export';
import {textureDefs} from './textures';
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
/** Samples opposing RGBA edges after rasterization. It measures actual seam mismatch;
 * callers decide whether a texture is acceptable at their desired threshold.
 */
export function pixelSeamReport(data:Uint8ClampedArray,width:number,height:number):{horizontal:number;vertical:number}{
 if(width<2||height<2||data.length!==width*height*4)throw new Error('Imagem RGBA inválida');
 let h=0,v=0;
 const delta=(a:number,b:number)=>{let total=0;for(let c=0;c<4;c++)total+=Math.abs(data[a+c]-data[b+c]);return total/4;};
 for(let y=0;y<height;y++)h+=delta((y*width)*4,(y*width+width-1)*4);
 for(let x=0;x<width;x++)v+=delta(x*4,((height-1)*width+x)*4);
 return {horizontal:Number((h/height).toFixed(2)),vertical:Number((v/width).toFixed(2))};
}
export function seamlessTileSvg(art:Artwork,size:number,axis:TileAxis='both'):string{
 validateTile({size,axis,repeats:2});
 const xs=axis==='vertical'?[0]:[-512,0,512],ys=axis==='horizontal'?[0]:[-512,0,512];
 const tiled=art.shapes.map(shape=>xs.flatMap(dx=>ys.map(dy=>
  '<g transform="translate('+dx+' '+dy+')">'+shapeMarkup(shape)+'</g>'
 ))).flat().join('');
 return '<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+size+'" viewBox="0 0 512 512" overflow="hidden">'+
 textureDefs(art.shapes.filter(sh=>sh.texture).map(sh=>({texture:sh.texture!,fill:sh.fill})))+
 tiled+'</svg>';
}
export function tilePreviewSvg(art:Artwork,options:TileOptions):string{
 validateTile(options);
 const {size,axis,repeats}=options;
 const cols=axis==='vertical'?1:repeats,rows=axis==='horizontal'?1:repeats;
 const raw=seamlessTileSvg(art,size,axis);const body=raw.slice(raw.indexOf('>')+1,raw.lastIndexOf('</svg>'));
 const parts=Array.from({length:cols*rows},(_,i)=>{
  const x=i%cols*size,y=Math.floor(i/cols)*size;
  return '<svg x="'+x+'" y="'+y+'" width="'+size+'" height="'+size+'" viewBox="0 0 512 512" overflow="hidden">'+body+'</svg>';
 });
 return '<svg xmlns="http://www.w3.org/2000/svg" width="'+cols*size+'" height="'+rows*size+'" viewBox="0 0 '+cols*size+' '+rows*size+'">'+parts.join('')+'</svg>';
}
export function exportTilePreview(art:Artwork,options:TileOptions):void{
 const svg=tilePreviewSvg(art,options);
 downloadBlob(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),'tile-repeat-preview.svg');
}
