import {describe,it,expect} from 'vitest';
import {translateShape,resizeShape,rotateShape} from './transforms';
import {summarizeReferences} from './consistency';
import type {Artwork,VectorShape} from './schema';
const rect:VectorShape={id:'one',name:'Rect',type:'rect',x:10,y:20,width:100,height:80,fill:'#112233',stroke:'#445566',strokeWidth:2,opacity:1,rotation:0};
const path:VectorShape={...rect,type:'path',d:'M 10 20 L 110 100'};
describe('vector transformations',()=>{
 it('translates SVG path coordinates not only metadata',()=>{
  const translated=translateShape(path,10,20);
  expect(translated.d).toContain('20 40');
  expect(translated.x).toBe(20);
 });
 it('scales vector path and metadata',()=>{
  const scaled=resizeShape(path,200,160);
  expect(scaled.width).toBe(200);
  expect(scaled.d).not.toBe(path.d);
 });
 it('normalizes rotations',()=>expect(rotateShape(rect,-90).rotation).toBe(270));
});
describe('visual consistency',()=>{
 it('selects few bounded references excluding active asset',()=>{
  const art=(i:number):Artwork=>({id:String(i),name:'Asset '+i,prompt:'',category:'weapons',size:512,createdAt:'',modifiedAt:'',stylePatch:{},shapes:[rect]});
  const refs=summarizeReferences([art(0),art(1),art(2),art(3),art(4),art(5)],'0');
  expect(refs).toHaveLength(4);
  expect(refs[0].colors).toContain('#112233');
 });
});
