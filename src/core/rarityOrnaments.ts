import type {VectorShape} from './schema';
import {uid} from './schema';
import type {Rarity} from './collectionTemplates';
import type {MaterialVariant} from './assetBatch';

const ornamentCounts:Record<Rarity,number>={Comum:0,Incomum:0,Raro:1,'Épico':2,'Lendário':3};

/** Adds small, isolated vector accents within a suitable component's bounds.
 * Never mutates the source shapes and never adds particle/aura effects.
 */
export function rarityOrnaments(base:VectorShape[],rarity:Rarity,material:MaterialVariant,category=''):VectorShape[]{
 const count=ornamentCounts[rarity];
 if(!count)return [];
 const candidates=base.filter(s=>s.width>=36&&s.height>=36&&s.opacity>0&&s.fill!=='none');
 if(!candidates.length)return [];
 const matches=(words:string[])=>candidates.find(s=>words.some(word=>s.name.toLowerCase().includes(word)));
 const isShield=/escudo|shield/.test(category+' '+base.map(s=>s.name).join(' ').toLowerCase());
 const isAxe=/machado|axe/.test(category+' '+base.map(s=>s.name).join(' ').toLowerCase());
 const isSword=/espada|sword|lâmina|blade|guarda|pomo/.test(category+' '+base.map(s=>s.name).join(' ').toLowerCase());
 const preferred=isShield?[['escudo','shield','revestimento'],['emblema','centro'],['borda','faixa']]:
  isAxe?[['cabeça','head','metal'],['fio','edge'],['cabo','handle']]:
  isSword?[['lâmina','blade'],['guarda','guard'],['pomo','pommel']]:[];
 const fallback=[...candidates].sort((a,b)=>b.width*b.height-a.width*a.height)[0];
 const targets=Array.from({length:count},(_,i)=>matches(preferred[i]||[])||fallback);
 return Array.from({length:count},(_,i)=>{
  const target=targets[i];
  const w=Math.min(target.width*.22,26),h=Math.min(target.height*.1,14);
  const centerX=target.x+target.width/2,centerY=target.y+target.height/2;
  const offset=(i-(count-1)/2)*Math.max(13,Math.min(target.height*.18,32));
  const x=centerX-w/2,y=Math.max(target.y+3,Math.min(target.y+target.height-h-3,centerY+offset-h/2));
  return {id:uid(),name:'Ornamento '+rarity+' · '+target.name,type:'ellipse' as const,
   x,y,width:w,height:h,fill:material.highlight,stroke:material.shadow,
   strokeWidth:Math.min(1.5,w*.08),rotation:target.rotation,opacity:0.87};
 });
}
