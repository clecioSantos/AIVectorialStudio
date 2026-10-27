import type {Artwork} from './schema';
import {seamlessTileSvg} from './seamlessTiles';
import {neighbors,tileRole,tileEdgeOverlay} from './autotile';
import type {TerrainGrid,TileRole} from './autotile';
import {downloadBlob} from './export';

export type TileFamily={id:string;name:string;baseArtworkId:string;variants:Partial<Record<TileRole,string>>;transitionArtworkId?:string};
export const familyRoles:TileRole[]=['isolated','center','edge-top','edge-bottom','edge-left','edge-right','corner-tl','corner-tr','corner-bl','corner-br','junction'];
export function resolveFamilyTile(family:TileFamily,artworks:Artwork[],mask:number):Artwork{
 const role=tileRole(mask);
 const id=family.variants[role]||family.baseArtworkId;
 const art=artworks.find(a=>a.id===id);
 if(!art)throw new Error('Arte da família não encontrada: '+role);
 return art;
}
export function validateFamily(family:TileFamily,artworks:Artwork[]):void{
 if(!family.name.trim())throw new Error('Nome da família obrigatório');
 if(!artworks.some(a=>a.id===family.baseArtworkId))throw new Error('Arte-base não encontrada');
 for(const id of Object.values(family.variants))if(id&&!artworks.some(a=>a.id===id))throw new Error('Variante não encontrada: '+id);
}
const inner=(art:Artwork,size:number)=>{
 const svg=seamlessTileSvg(art,size,'both');
 return svg.slice(svg.indexOf('>')+1,svg.lastIndexOf('</svg>'));
};
export function familyPreviewSvg(family:TileFamily,artworks:Artwork[],grid:TerrainGrid,size:number):string{
 validateFamily(family,artworks);
 if(!Number.isInteger(size)||size<16||size>512)throw new Error('Dimensão inválida');
 if(!grid.length||!grid[0]?.length||grid.length>20||grid[0].length>20||grid.some(row=>row.length!==grid[0].length))throw new Error('Grade inválida');
 const w=grid[0].length,h=grid.length;
 const pieces=grid.flatMap((row,y)=>row.map((active,x)=>{
  if(!active)return '';
  const mask=neighbors(grid,x,y),role=tileRole(mask);
  const art=resolveFamilyTile(family,artworks,mask);
  const body=inner(art,size);
  return '<svg x="'+x*size+'" y="'+y*size+'" width="'+size+'" height="'+size+'" viewBox="0 0 512 512" data-role="'+role+'" data-mask="'+mask+'">'+body+tileEdgeOverlay(mask)+'</svg>';
 })).join('');
 return '<svg xmlns="http://www.w3.org/2000/svg" width="'+w*size+'" height="'+h*size+'" viewBox="0 0 '+w*size+' '+h*size+'">'+pieces+'</svg>';
}
export function familyManifest(family:TileFamily,artworks:Artwork[],grid:TerrainGrid,size:number){
 validateFamily(family,artworks);
 return {format:'aivs-tile-family-v1',family,cellSize:size,width:grid[0]?.length||0,height:grid.length,cells:grid.flatMap((row,y)=>row.flatMap((active,x)=>active?[{x,y,mask:neighbors(grid,x,y),role:tileRole(neighbors(grid,x,y)),artworkId:resolveFamilyTile(family,artworks,neighbors(grid,x,y)).id}]:[]))};
}
export function exportFamily(family:TileFamily,artworks:Artwork[],grid:TerrainGrid,size:number):void{
 downloadBlob(new Blob([familyPreviewSvg(family,artworks,grid,size)],{type:'image/svg+xml;charset=utf-8'}),'tile-family.svg');
 downloadBlob(new Blob([JSON.stringify(familyManifest(family,artworks,grid,size),null,2)],{type:'application/json'}),'tile-family.json');
}
