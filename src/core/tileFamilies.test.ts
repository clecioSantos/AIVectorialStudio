import {describe,it,expect} from 'vitest';
import {familyRoles,familyPreviewSvg,familyManifest,resolveFamilyTile} from './tileFamilies';
import type {Artwork} from './schema';
import {parseTerrainGrid} from './autotile';
const mk=(id:string):Artwork=>({id,name:id,category:'terrain',prompt:'',createdAt:'',modifiedAt:'',size:512,stylePatch:{},shapes:[{id:'shape-'+id,name:id,type:'rect',x:0,y:0,width:512,height:512,fill:'#997755',stroke:'none',strokeWidth:0,opacity:1,rotation:0}]});
const artworks=[mk('base'),mk('top')];
const family={id:'f',name:'Earth',baseArtworkId:'base',variants:{'edge-top':'top'}};
describe('tile families',()=>{
 it('exposes every 4-neighbor terrain role',()=>expect(familyRoles).toHaveLength(11));
 it('selects explicit variants, otherwise reuses base geometry',()=>{
  expect(resolveFamilyTile(family,artworks,4).id).toBe('top');
  expect(resolveFamilyTile(family,artworks,15).id).toBe('base');
 });
 it('exports map with role-resolved artwork identifiers',()=>{
  const grid=parseTerrainGrid('###\n###');
  const manifest=familyManifest(family,artworks,grid,64);
  expect(manifest.cells.length).toBe(6);
  expect(manifest.cells.some(c=>c.artworkId==='top')).toBe(true);
  const svg=familyPreviewSvg(family,artworks,grid,64);
  expect(svg).toContain('viewBox="0 0 192 128"');
  expect(svg).toContain('data-role="edge-top"');
 });
 it('fails when a role points to an unknown asset',()=>{
  expect(()=>resolveFamilyTile({...family,variants:{center:'missing'}},artworks,15)).toThrow();
 });
});
