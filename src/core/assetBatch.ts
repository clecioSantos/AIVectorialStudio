import type {Artwork,StudioStyle,VectorShape} from './schema';
import {uid,now} from './schema';
export type MaterialVariant={name:string;base:string;highlight:string;shadow:string};
export const defaultMaterials:MaterialVariant[]=[
 {name:'Ferro',base:'#777C7E',highlight:'#BEC4C5',shadow:'#404547'},
 {name:'Cobre',base:'#AD6F47',highlight:'#E3AA75',shadow:'#623E2D'},
 {name:'Ouro',base:'#C59A35',highlight:'#F4DC83',shadow:'#72531F'},
 {name:'Cristal',base:'#348FCA',highlight:'#B0E8FF',shadow:'#244B89'}
];
export function parseBatchLines(value:string,limit=24):string[]{
 const lines=value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 if(lines.length>limit)throw new Error('Máximo de '+limit+' itens por lote');
 if(lines.some(x=>x.length>300))throw new Error('Descrição de item muito longa');
 return lines;
}
export function recolorMaterial(art:Artwork,style:StudioStyle,material:MaterialVariant):Artwork{
 const primary=style.palette.primary[0];
 const known=new Map<string,string>([
 [primary.toLowerCase(),material.base],
 [style.palette.highlight.toLowerCase(),material.highlight],
 [style.palette.shadow.toLowerCase(),material.shadow]
 ]);
 const shapes:VectorShape[]=art.shapes.map(sh=>({
  ...sh,id:uid(),fill:known.get(sh.fill.toLowerCase())||sh.fill,
  stroke:known.get(sh.stroke.toLowerCase())||sh.stroke
 }));
 return {...art,id:uid(),name:art.name+' · '+material.name,createdAt:now(),modifiedAt:now(),shapes};
}
export type AtlasCell={id:string;name:string;x:number;y:number;width:number;height:number};
export function planAtlas(artworks:Artwork[],cellSize:number,columns:number,padding:number):{width:number;height:number;cells:AtlasCell[]}{
 if(!Number.isInteger(cellSize)||cellSize<32||cellSize>1024)throw new Error('Tamanho de frame inválido');
 if(!Number.isInteger(columns)||columns<1||columns>16)throw new Error('Colunas inválidas');
 if(!Number.isInteger(padding)||padding<0||padding>64)throw new Error('Padding inválido');
 if(!artworks.length||artworks.length>256)throw new Error('Selecione entre 1 e 256 artes');
 const pitch=cellSize+padding*2,rows=Math.ceil(artworks.length/columns);
 if(pitch*columns>8192||pitch*rows>8192)throw new Error('Atlas excede 8192 px por dimensão');
 return {width:pitch*columns,height:pitch*rows,cells:artworks.map((a,i)=>({
  id:a.id,name:a.name,x:(i%columns)*pitch+padding,y:Math.floor(i/columns)*pitch+padding,width:cellSize,height:cellSize
 }))};
}
