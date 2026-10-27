import {describe,it,expect} from 'vitest';
import {createSharedGeometryVariant} from './sharedGeometry';
import {defaultStyle} from './schema';
import {planCollection,templatePresets} from './collectionTemplates';
import type {Artwork} from './schema';
const art:Artwork={id:'base',name:'Espada',category:'weapons',prompt:'',createdAt:'',modifiedAt:'',size:512,stylePatch:{},shapes:[
 {id:'blade',name:'Lâmina',type:'polygon',x:10,y:10,width:100,height:200,points:'10,10 110,10 60,210',fill:defaultStyle.palette.primary[0],stroke:defaultStyle.palette.shadow,strokeWidth:2,rotation:0,opacity:1},
 {id:'handle',name:'Cabo',type:'rect',x:50,y:210,width:20,height:80,fill:'#815733',stroke:'none',strokeWidth:0,rotation:0,opacity:1}
]};
describe('shared geometry collection',()=>{
 it('preserves geometry and other parts while recoloring materials',()=>{
  const [entry]=planCollection({...templatePresets[0],materials:['Ouro'],rarities:['Raro']});
  const variant=createSharedGeometryVariant(art,defaultStyle,entry);
  expect(variant.id).not.toBe(art.id);
  expect(variant.shapes.map(s=>[s.type,s.x,s.y,s.width,s.height,s.points])).toEqual(art.shapes.map(s=>[s.type,s.x,s.y,s.width,s.height,s.points]));
  expect(variant.shapes[0].fill).not.toBe(art.shapes[0].fill);
  expect(variant.shapes[1].fill).toBe('#815733');
  expect(variant.shapes[0].id).not.toBe(art.shapes[0].id);
 });
 it('changes rarity palette but not geometry',()=>{
  const entries=planCollection({...templatePresets[0],materials:['Ferro'],rarities:['Comum','Lendário']});
  const [a,b]=entries.map(e=>createSharedGeometryVariant(art,defaultStyle,e));
  expect(a.shapes[0].fill).not.toBe(b.shapes[0].fill);
  expect(a.shapes[0].points).toBe(b.shapes[0].points);
 });
 it('rejects empty source artwork',()=>{
  const entry=planCollection(templatePresets[0])[0];
  expect(()=>createSharedGeometryVariant({...art,shapes:[]},defaultStyle,entry)).toThrow();
 });
});
