import {describe,it,expect} from 'vitest';
import {planAtlas,parseBatchLines,recolorMaterial,defaultMaterials} from './assetBatch';
import {defaultStyle} from './schema';
import type {Artwork} from './schema';
const art=(id:string):Artwork=>({id,name:id,prompt:'',category:'items',createdAt:'',modifiedAt:'',size:512,stylePatch:{},shapes:[{id:'s',name:'base',type:'rect',x:0,y:0,width:10,height:10,fill:defaultStyle.palette.primary[0],stroke:defaultStyle.palette.shadow,strokeWidth:2,rotation:0,opacity:1}]});
describe('asset batch',()=>{
 it('accepts a prompt per line',()=>expect(parseBatchLines('Sword\n\nShield')).toEqual(['Sword','Shield']));
 it('rejects oversized batches',()=>expect(()=>parseBatchLines(Array(25).fill('x').join('\n'))).toThrow());
 it('creates independent recolored artwork',()=>{const input=art('one'),result=recolorMaterial(input,defaultStyle,defaultMaterials[2]);expect(result.id).not.toBe(input.id);expect(result.shapes[0].fill).toBe(defaultMaterials[2].base);expect(result.shapes[0].id).not.toBe(input.shapes[0].id);});
 it('packs arbitrary exact frame sizes',()=>{const p=planAtlas(['a','b','c','d','e'].map(art),179,4,0);expect(p.width).toBe(716);expect(p.height).toBe(358);expect(p.cells[4].y).toBe(179);});
 it('adds padding between cells',()=>{const p=planAtlas(['a','b'].map(art),128,2,3);expect(p.width).toBe(268);expect(p.cells[1].x).toBe(137);});
 it('enforces texture limits',()=>expect(()=>planAtlas(Array(256).fill(null).map((_,i)=>art(String(i))),1024,16,4)).toThrow());
});
