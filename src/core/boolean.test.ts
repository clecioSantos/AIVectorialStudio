import {describe,it,expect} from 'vitest';
import {combineShapes} from './boolean';
import type {VectorShape} from './schema';
const r=(id:string,x:number):VectorShape=>({id,name:id,type:'rect',x,y:20,width:80,height:80,fill:'#4488CC',stroke:'none',strokeWidth:0,rotation:0,opacity:1});
describe('paper boolean paths',()=>{
 it('unites overlapping rectangles into editable SVG geometry',()=>{
  const out=combineShapes([r('a',20),r('b',60)],'union');
  expect(out.type).toBe('path');
  expect(out.width).toBeGreaterThan(80);
  expect(out.d).toMatch(/[MLC]/);
 });
 it('computes the intersection of overlapping rectangles',()=>{
  const out=combineShapes([r('a',20),r('b',60)],'intersect');
  expect(Math.round(out.width)).toBe(40);
 });
});
