import {describe,it,expect} from 'vitest';
import {templatePresets,planCollection,collectionStyle,nameCollectionArt} from './collectionTemplates';
import {defaultStyle} from './schema';
import type {Artwork} from './schema';
describe('intelligent collection templates',()=>{
 it('generates deterministic material x rarity combinations',()=>{
  const options={...templatePresets[0],materials:['Ferro','Ouro'],rarities:['Comum','Raro'] as (typeof templatePresets)[number]['rarities']};
  const entries=planCollection(options);expect(entries).toHaveLength(4);
  expect(entries[0].material).toBe('Ferro');expect(entries[3].rarity).toBe('Raro');
  expect(entries.every(x=>x.prompt.includes('fundo transparente'))).toBe(true);
 });
 it('limits combinations to prevent excessive paid API calls',()=>{
  expect(()=>planCollection({...templatePresets[0],materials:['Ferro','Cobre','Ouro','Cristal'],rarities:['Comum','Incomum','Raro','Épico','Lendário']},12)).toThrow();
 });
 it('rejects empty selections',()=>expect(()=>planCollection({...templatePresets[0],materials:[]})).toThrow());
 it('applies material colors without mutating the project style',()=>{
  const material=collectionStyle(defaultStyle,'Cristal');
  expect(material.palette.primary[0]).toBe('#348FCA');
  expect(defaultStyle.palette.primary[0]).not.toBe(material.palette.primary[0]);
 });
 it('preserves editable shapes when naming collection items',()=>{
  const a:Artwork={id:'1',name:'original',category:'items',prompt:'',createdAt:'',modifiedAt:'',size:512,stylePatch:{},shapes:[]};
  const entry=planCollection(templatePresets[0])[0];
  expect(nameCollectionArt(a,entry).id).toBe('1');
 });
});
