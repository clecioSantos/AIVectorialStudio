import {describe,it,expect} from 'vitest';
import {toEditableCubicPath} from './pathNormalization';
import {parseBezier,addBezierNode,removeBezierAnchor,serializeBezier,moveBezierPointLinked,closeBezier} from './bezier';

describe('SVG path conversion',()=>{
 it('converts relative lines and horizontal/vertical segments',()=>{
  const path=toEditableCubicPath('M 10 10 l 30 0 v 20 h -30 z');
  expect(path).toContain('C ');
  expect(parseBezier(path||'')?.length).toBeGreaterThan(4);
 });
 it('converts quadratic curves into cubic curves',()=>{
  expect(toEditableCubicPath('M 0 0 Q 60 100 120 0')).toContain('C');
 });
 it('converts elliptical arcs into cubic geometry',()=>{
  const d=toEditableCubicPath('M 0 0 A 30 20 0 0 1 60 0');
  expect(d).toContain('C');
  expect(parseBezier(d||'')).not.toBeNull();
 });
 it('rejects multiple subpaths instead of corrupting them',()=>{
  expect(toEditableCubicPath('M 0 0 L 1 1 M 10 10 L 20 20')).toBeNull();
 });
 it('rejects non-path syntax',()=>expect(toEditableCubicPath('<script>')).toBeNull());
});
describe('Bezier editing',()=>{
 const d='M 0 0 C 10 0 20 0 30 0 C 40 0 50 0 60 0';
 it('splits a segment with equivalent cubic structure',()=>{
  const original=parseBezier(d)!;const split=addBezierNode(original,0);
  expect(split.length).toBe(original.length+3);
  expect(parseBezier(serializeBezier(split))).not.toBeNull();
 });
 it('removes an intermediate anchor',()=>{
  expect(removeBezierAnchor(parseBezier(d)!,3).length).toBe(4);
 });
 it('moves opposite control handle when linked',()=>{
  const points=parseBezier(d)!;
  const moved=moveBezierPointLinked(points,4,40,10,true);
  expect(moved[2].y).toBeLessThan(0);
 });
 it('closes an open curve',()=>{
  const result=closeBezier(parseBezier(d)!);
  expect(result[result.length-1].x).toBe(result[0].x);
 });
});
