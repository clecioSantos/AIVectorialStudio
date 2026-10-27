import type {Artwork,VectorShape} from './schema';
import {uid,now} from './schema';
import {familyRoles} from './tileFamilies';
import type {TileFamily} from './tileFamilies';
import type {TileRole} from './autotile';

const exposed:Record<TileRole,number>={
 isolated:0,'center':15,'edge-top':14,'edge-bottom':11,'edge-left':7,'edge-right':13,
 'corner-tl':6,'corner-tr':12,'corner-bl':3,'corner-br':9,junction:5
};
export function deriveTileVariant(base:Artwork,role:TileRole,topColor='#6EAE59'):Artwork{
 if(!base.shapes.length)throw new Error('Arte-base vazia');
 const mask=exposed[role];
 const sides=[!(mask&1),!(mask&2),!(mask&4),!(mask&8)];
 const make=(name:string,x:number,y:number,width:number,height:number):VectorShape=>({
  id:uid(),name,type:'rect',x,y,width,height,rotation:0,opacity:1,fill:topColor,stroke:'none',strokeWidth:0
 });
 // Keep all original geometry, fills and vector textures unchanged. Add thin trim
 // only along exposed edges; do not duplicate a line at shared boundaries.
 const trim:VectorShape[]=[];
 const thickness=8;
 if(sides[0])trim.push(make('Superfície superior',0,0,512,thickness));
 if(sides[1])trim.push(make('Borda direita',512-thickness,0,thickness,512));
 if(sides[2])trim.push(make('Borda inferior',0,512-thickness,512,thickness));
 if(sides[3])trim.push(make('Borda esquerda',0,0,thickness,512));
 return {...structuredClone(base),id:uid(),name:base.name+' · '+role,prompt:base.prompt+'; variante auto '+role,createdAt:now(),modifiedAt:now(),shapes:[...base.shapes.map(s=>({...structuredClone(s),id:uid()})),...trim]};
}
export function generateTileFamily(base:Artwork,topColor='#6EAE59'):{family:TileFamily;artworks:Artwork[]}{
 const artworks=familyRoles.map(role=>deriveTileVariant(base,role,topColor));
 const variants=Object.fromEntries(familyRoles.map((role,i)=>[role,artworks[i].id])) as Record<TileRole,string>;
 return {family:{id:uid(),name:base.name+' · família automática',baseArtworkId:base.id,variants},artworks};
}
