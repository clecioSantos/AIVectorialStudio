import {describe,it,expect} from 'vitest';
import {texturePattern,texturePatternId,textureDefs} from './textures';
import {serializeSvg} from './export';
import type {Artwork} from './schema';
describe('reusable SVG textures',()=>{
 const wood={kind:'wood' as const,scale:1,intensity:.5};
 it('creates stable ids for equivalent texture and color',()=>expect(texturePatternId(wood,'#AABBCC')).toBe(texturePatternId({...wood},'#AABBCC')));
 it('preserves the original base fill behind the texture',()=>expect(texturePattern(wood,'#AABBCC')).toContain('fill="#AABBCC"'));
 it('deduplicates patterns shared by layers',()=>{
  const defs=textureDefs([{texture:wood,fill:'#AABBCC'},{texture:wood,fill:'#AABBCC'}]);
  expect(defs.match(/<pattern /g)).toHaveLength(1);
 });
 it('exports SVG with reusable vector pattern fill and transparent background',()=>{
  const art:Artwork={id:'a',name:'Madeira',prompt:'',category:'props',createdAt:'',modifiedAt:'',size:512,stylePatch:{},shapes:[{id:'b',name:'Placa',type:'rect',x:20,y:20,width:100,height:100,rotation:0,opacity:1,fill:'#AABBCC',stroke:'none',strokeWidth:0,texture:wood}]};
  const svg=serializeSvg(art);
  expect(svg).toContain('<pattern');
  expect(svg).toContain('fill="url(#tx-wood-100-50-AABBCC)"');
  expect(svg).not.toContain('fill="#FFFFFF"/></svg>');
 });
});