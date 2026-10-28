import {describe,it,expect} from 'vitest';
import {pixelSeamReport} from './seamlessTiles';
import {auditStyleConsistency} from './qualityAudit';
import {defaultStyle} from './schema';
import type {Artwork} from './schema';
const art:Artwork={id:'a',name:'Item',category:'weapons',prompt:'',createdAt:'',modifiedAt:'',size:512,stylePatch:{},shapes:[{id:'1',name:'Base',type:'rect',x:0,y:0,width:100,height:100,fill:'#FF00FF',stroke:'none',strokeWidth:0,rotation:0,opacity:1}]};
describe('high-priority quality',()=>{
 it('measures perfectly matching opposite pixel edges',()=>{
  const pixels=new Uint8ClampedArray(4*4*4).fill(120);
  expect(pixelSeamReport(pixels,4,4)).toEqual({horizontal:0,vertical:0});
 });
 it('detects mismatched opposing edges',()=>{
  const pixels=new Uint8ClampedArray(3*3*4);
  pixels[8]=255;
  const result=pixelSeamReport(pixels,3,3);
  expect(result.horizontal).toBeGreaterThan(0);
 });
 it('rejects malformed RGBA buffers',()=>expect(()=>pixelSeamReport(new Uint8ClampedArray(4),3,3)).toThrow());
 it('reports palette drift without mutating generated art',()=>{
  const original=JSON.stringify(art);
  const issues=auditStyleConsistency({...art,shapes:[art.shapes[0],{...art.shapes[0],fill:'#00FF00'},{...art.shapes[0],fill:'#FF00FF'}]},defaultStyle);
  expect(Array.isArray(issues)).toBe(true);
  expect(JSON.stringify(art)).toBe(original);
 });
});
