import {describe,it,expect} from 'vitest';
import {makeComponent,instantiate,syncLinkedShapes,componentPackage,validateComponentPackage} from './components';
import type {VectorShape} from './schema';
const rect:VectorShape={id:'r',name:'Gema',type:'rect',x:10,y:20,width:20,height:30,fill:'#FF0000',stroke:'none',strokeWidth:1,rotation:0,opacity:1};
describe('component library',()=>{
 it('copies multi-layer geometry and metadata',()=>{
  const c=makeComponent([rect,{...rect,id:'other',x:40}], 'Gemas','Ornamentos',['gem','raro']);
  expect(c.shapes).toHaveLength(2);expect(c.version).toBe(1);
 });
 it('creates detached clones and linked instances with consistent positioning',()=>{
  const c=makeComponent([rect],'Gema');
  const [s]=instantiate(c,{x:100,y:120,scale:2,rotation:45,flipX:false,linked:true});
  expect([s.x,s.y,s.width,s.height]).toEqual([100,120,40,60]);
  expect(s.componentId).toBe(c.id);
  expect(instantiate(c,{x:0,y:0,scale:1,rotation:0,flipX:false,linked:false})[0].componentId).toBeUndefined();
 });
 it('synchronizes linked style and leaves detached untouched',()=>{
  const c=makeComponent([rect],'Gema');
  const [linked]=instantiate(c,{x:100,y:100,scale:1,rotation:0,flipX:false,linked:true});
  const updated={...c,version:2,shapes:[{...rect,fill:'#00FF00'}]};
  const result=syncLinkedShapes([linked,rect],updated);
  expect(result[0].fill).toBe('#00FF00');
  expect(result[0].x).toBe(100);
  expect(result[1].fill).toBe('#FF0000');
 });
 it('validates portable packages',()=>{
  const c=makeComponent([rect],'Gema');
  const imported=validateComponentPackage(componentPackage([c]));
  expect(imported[0].id).not.toBe(c.id);
  expect(imported[0].shapes[0].name).toBe('Gema');
 });
});
