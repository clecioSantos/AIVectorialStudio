import {describe,it,expect} from 'vitest';
import {parseTerrainGrid,neighbors,tileRole,tileEdgeOverlay,autotilePreviewSvg} from './autotile';
import type {Artwork} from './schema';
const art:Artwork={id:'a',name:'ground',category:'terrain',prompt:'',createdAt:'',modifiedAt:'',size:512,stylePatch:{},shapes:[{id:'one',name:'Earth',type:'rect',x:0,y:0,width:512,height:512,fill:'#AA7744',stroke:'none',strokeWidth:0,opacity:1,rotation:0}]};
describe('autotile v2',()=>{
 it('parses rectangular terrain and rejects irregular grids',()=>{
  expect(parseTerrainGrid('.#\n##')).toEqual([[false,true],[true,true]]);
  expect(()=>parseTerrainGrid('##\n#')).toThrow();
 });
 it('detects four-neighbor masks and exposed edges',()=>{
  const grid=parseTerrainGrid('.#.\n###\n.#.');
  expect(neighbors(grid,1,1)).toBe(15);
  expect(tileRole(15)).toBe('center');
  expect(tileRole(6)).toBe('corner-tl');
  expect(tileRole(4)).toBe('edge-top');
 });
 it('renders only exposed outlines and exports correct grid dimensions',()=>{
  expect(tileEdgeOverlay(15)).not.toContain('<path');
  expect(tileEdgeOverlay(0).match(/<path/g)).toHaveLength(4);
  const svg=autotilePreviewSvg(art,parseTerrainGrid('##\n##'),64);
  expect(svg).toContain('viewBox="0 0 128 128"');
  expect(svg.match(/data-mask=/g)).toHaveLength(4);
 });
});
