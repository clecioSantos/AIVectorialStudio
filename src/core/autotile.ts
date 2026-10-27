import type {Artwork} from './schema';
import {seamlessTileSvg} from './seamlessTiles';
import {downloadBlob} from './export';
export type TerrainGrid=boolean[][];
export type TileRole='isolated'|'center'|'edge-top'|'edge-bottom'|'edge-left'|'edge-right'|'corner-tl'|'corner-tr'|'corner-bl'|'corner-br'|'junction';
export function neighbors(grid:TerrainGrid,x:number,y:number):number{
 const at=(xx:number,yy:number)=>!!grid[yy]?.[xx];
 return (at(x,y-1)?1:0)|(at(x+1,y)?2:0)|(at(x,y+1)?4:0)|(at(x-1,y)?8:0);
}
export function tileRole(mask:number):TileRole{
 if(mask===0)return 'isolated';
 const n=!!(mask&1),e=!!(mask&2),s=!!(mask&4),w=!!(mask&8);
 if(!n&&!w&&e&&s)return 'corner-tl';
 if(!n&&!e&&w&&s)return 'corner-tr';
 if(!s&&!w&&n&&e)return 'corner-bl';
 if(!s&&!e&&n&&w)return 'corner-br';
 if(!n&&s)return 'edge-top';
 if(!s&&n)return 'edge-bottom';
 if(!w&&e)return 'edge-left';
 if(!e&&w)return 'edge-right';
 if(mask===15)return 'center';
 return 'junction';
}
export function parseTerrainGrid(input:string):TerrainGrid{
 const lines=input.trim().split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
 if(lines.length===0||lines.length>20)throw new Error('Grade deve ter entre 1 e 20 linhas');
 const width=lines[0].length;
 if(width===0||width>20||lines.some(s=>s.length!==width||/[^.#01]/.test(s)))throw new Error('Use grade retangular com # e .');
 return lines.map(line=>[...line].map(c=>c==='#'||c==='1'));
}
export function autotilePreviewSvg(art:Artwork,grid:TerrainGrid,size:number):string{
 if(!grid.length||!grid[0]?.length)throw new Error('Grade vazia');
 if(!Number.isInteger(size)||size<16||size>512)throw new Error('Tamanho inválido');
 const w=grid[0].length,h=grid.length;
 if(w>20||h>20||grid.some(row=>row.length!==w))throw new Error('Grade inválida');
 const tile=seamlessTileSvg(art,size,'both');
 const body=tile.slice(tile.indexOf('>')+1,tile.lastIndexOf('</svg>'));
 const items=grid.flatMap((row,y)=>row.map((active,x)=>{
  if(!active)return '';
  const mask=neighbors(grid,x,y),role=tileRole(mask);
  return '<svg x="'+x*size+'" y="'+y*size+'" width="'+size+'" height="'+size+'" viewBox="0 0 512 512" data-mask="'+mask+'" data-role="'+role+'">'+body+'</svg>';
 })).join('');
 return '<svg xmlns="http://www.w3.org/2000/svg" width="'+w*size+'" height="'+h*size+'" viewBox="0 0 '+w*size+' '+h*size+'">'+items+'</svg>';
}
export function exportAutotile(art:Artwork,grid:TerrainGrid,size:number):void{
 downloadBlob(new Blob([autotilePreviewSvg(art,grid,size)],{type:'image/svg+xml;charset=utf-8'}),'autotile-map.svg');
 const cells=grid.flatMap((row,y)=>row.flatMap((active,x)=>active?[{x,y,mask:neighbors(grid,x,y),role:tileRole(neighbors(grid,x,y))}]:[]));
 downloadBlob(new Blob([JSON.stringify({format:'aivs-autotile-v2',size,gridWidth:grid[0].length,gridHeight:grid.length,cells},null,2)],{type:'application/json'}),'autotile-map.json');
}
