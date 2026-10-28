import {describe,it,expect} from 'vitest';
import {localArtReview} from './artReview';
import type {Artwork} from './schema';
const art:Artwork={id:'a',name:'Item',category:'items',prompt:'teste',createdAt:'',modifiedAt:'',size:512,stylePatch:{},shapes:[{id:'1',name:'Base',type:'rect',x:10,y:10,width:100,height:100,fill:'#FFFFFF',stroke:'none',strokeWidth:0,rotation:0,opacity:1}]};
describe('art quality gate',()=>{
 it('rejects empty artwork',()=>expect(localArtReview({...art,shapes:[]}).passed).toBe(false));
 it('reports invalid positions',()=>expect(localArtReview({...art,shapes:[{...art.shapes[0],x:NaN}]}).issues).toContain('Geometria inválida'));
 it('accepts valid artwork with multiple shapes',()=>expect(localArtReview({...art,shapes:[art.shapes[0],{...art.shapes[0],id:'2'},{...art.shapes[0],id:'3'}]}).passed).toBe(true));
});
