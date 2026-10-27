import {describe,it,expect} from 'vitest';
import {tilePreviewSvg,tileIssues,validateTile} from './seamlessTiles';
import type {Artwork,VectorShape} from './schema';
const base:VectorShape={id:'one',name:'Chão',type:'rect',x:0,y:0,width:512,height:512,fill:'#885522',stroke:'none',strokeWidth:0,rotation:0,opacity:1};
const art:Artwork={id:'a',name:'Chão',prompt:'',category:'terrain',createdAt:'',modifiedAt:'',size:512,stylePatch:{},shapes:[base]};
describe('tile repeat',()=>{
 it('repeats exactly three by three without gaps in viewBox',()=>{
  const svg=tilePreviewSvg(art,{size:64,axis:'both',repeats:3});
  expect(svg).toContain('viewBox="0 0 192 192"');
  expect(svg.match(/<svg x=/g)).toHaveLength(9);
  expect(svg).toContain('x="128" y="128"');
 });
 it('supports twenty tiles arranged horizontally',()=>{
  const svg=tilePreviewSvg(art,{size:179,axis:'horizontal',repeats:20});
  expect(svg).toContain('viewBox="0 0 3580 179"');
  expect(svg.match(/<svg x=/g)).toHaveLength(20);
 });
 it('rejects invalid sizes and repetition counts',()=>{
  expect(()=>validateTile({size:0,axis:'both',repeats:3})).toThrow();
  expect(()=>validateTile({size:64,axis:'both',repeats:21})).toThrow();
 });
 it('warns about strokes that can show tile seams',()=>{
  expect(tileIssues([{...base,stroke:'#000000',strokeWidth:3}],512,'horizontal').length).toBeGreaterThan(0);
  expect(tileIssues([base],512,'horizontal')).toEqual([]);
 });
});