import {describe,it,expect} from 'vitest';
import {rarityOrnaments} from './rarityOrnaments';
import {defaultMaterials} from './assetBatch';
import type {VectorShape} from './schema';
const shape:VectorShape={id:'main',name:'Blade',type:'rect',x:30,y:50,width:130,height:250,fill:'#888888',stroke:'#222222',strokeWidth:2,opacity:1,rotation:0};
describe('rarity ornaments',()=>{
 it('keeps common and uncommon variants unornamented',()=>{
  expect(rarityOrnaments([shape],'Comum',defaultMaterials[0])).toHaveLength(0);
  expect(rarityOrnaments([shape],'Incomum',defaultMaterials[0])).toHaveLength(0);
 });
 it('adds independent editable accents for higher rarities',()=>{
  const rare=rarityOrnaments([shape],'Raro',defaultMaterials[2]);
  const epic=rarityOrnaments([shape],'Épico',defaultMaterials[2]);
  const legendary=rarityOrnaments([shape],'Lendário',defaultMaterials[2]);
  expect([rare.length,epic.length,legendary.length]).toEqual([1,2,3]);
  expect(legendary.every(s=>s.type==='ellipse'&&s.id!==shape.id)).toBe(true);
  expect(legendary.every(s=>s.x>=shape.x&&s.x+s.width<=shape.x+shape.width&&s.y>=shape.y&&s.y+s.height<=shape.y+shape.height)).toBe(true);
  expect(shape.fill).toBe('#888888');
 });
 it('targets named sword components without changing their geometry',()=>{
  const sword=[{...shape,name:'Lâmina',id:'blade'},{...shape,id:'guard',name:'Guarda',x:40,y:310,width:80,height:45},{...shape,id:'pommel',name:'Pomo',x:70,y:390,width:40,height:40}];
  const ornaments=rarityOrnaments(sword,'Lendário',defaultMaterials[2],'weapons');
  expect(ornaments.map(x=>x.name)).toEqual(['Ornamento Lendário · Lâmina','Ornamento Lendário · Guarda','Ornamento Lendário · Pomo']);
  expect(sword[0].fill).toBe('#888888');
 });
 it('targets shield center emblem when available',()=>{
  const shield=[{...shape,name:'Escudo',id:'shield'},{...shape,name:'Emblema',id:'emblem',x:60,y:110,width:60,height:60}];
  const ornaments=rarityOrnaments(shield,'Épico',defaultMaterials[2],'weapons');
  expect(ornaments[1].name).toContain('Emblema');
 });
 it('skips tiny or transparent components',()=>{
  expect(rarityOrnaments([{...shape,width:10,height:10}],'Lendário',defaultMaterials[0])).toEqual([]);
 });
});
