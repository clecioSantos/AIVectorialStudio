import type {Artwork,StudioStyle} from './schema';
import {defaultMaterials} from './assetBatch';
export type Rarity='Comum'|'Incomum'|'Raro'|'Épico'|'Lendário';
export type CollectionTemplate={id:string;name:string;basePrompt:string;category:string;materials:string[];rarities:Rarity[]};
export const rarityLevels:Rarity[]=['Comum','Incomum','Raro','Épico','Lendário'];
export const templatePresets:CollectionTemplate[]=[
 {id:'swords',name:'Família de espadas',basePrompt:'Espada medieval vista lateral, silhueta consistente, arma isolada',category:'weapons',materials:['Ferro','Cobre','Ouro','Cristal'],rarities:['Comum','Raro','Épico']},
 {id:'shields',name:'Família de escudos',basePrompt:'Escudo de fantasia medieval frontal, mesma forma geral, objeto isolado',category:'weapons',materials:['Ferro','Ouro','Cristal'],rarities:['Comum','Raro','Lendário']},
 {id:'axes',name:'Família de machados',basePrompt:'Machado medieval em perfil, mesmo modelo e proporções, objeto isolado',category:'weapons',materials:['Ferro','Cobre','Ouro'],rarities:['Comum','Raro','Épico']},
 {id:'icons',name:'Ícones de inventário',basePrompt:'Ícone de inventário de fantasia, composição centralizada, linhas simples',category:'icons',materials:['Ferro','Ouro','Cristal'],rarities:['Comum','Raro','Épico']}
];
export type CollectionEntry={id:string;name:string;prompt:string;category:string;material:string;rarity:Rarity};
const details:Record<Rarity,string>={
 'Comum':'ornamentação mínima, acabamento simples, nenhum efeito extra',
 'Incomum':'pequenos detalhes decorativos, composição limpa',
 'Raro':'ornamentos moderados, acabamento refinado sem excesso de partículas',
 'Épico':'detalhes ricos e moderados, sem aura, sem fundo',
 'Lendário':'design ornamental distinto, silhueta preservada, sem aura ou efeitos fora do objeto'
};
export function planCollection(template:CollectionTemplate,limit=24):CollectionEntry[]{
 const materials=[...new Set(template.materials)].filter(n=>defaultMaterials.some(m=>m.name===n));
 const rarities=[...new Set(template.rarities)].filter(x=>rarityLevels.includes(x));
 if(!template.basePrompt.trim()||!materials.length||!rarities.length)throw new Error('Template incompleto');
 if(template.basePrompt.length>300)throw new Error('Descrição muito longa');
 const total=materials.length*rarities.length;
 if(total>limit)throw new Error('Coleção excede '+limit+' combinações');
 return materials.flatMap(material=>rarities.map(rarity=>({
 id:template.id+'-'+material+'-'+rarity,
 name:template.name+' · '+material+' · '+rarity,
 category:template.category,material,rarity,
 prompt:template.basePrompt+'. Material principal: '+material+'. Raridade '+rarity+': '+details[rarity]+'. Preserve geometria, escala e perspectiva entre todas as variantes; objeto isolado, fundo transparente.'
 })));
}
export function collectionStyle(style:StudioStyle,materialName:string):StudioStyle{
 const material=defaultMaterials.find(m=>m.name===materialName);
 if(!material)throw new Error('Material desconhecido');
 return {...style,palette:{...style.palette,primary:[material.base,...style.palette.primary.slice(1)],highlight:material.highlight,shadow:material.shadow}};
}
export function nameCollectionArt(art:Artwork,entry:CollectionEntry):Artwork{
 return {...art,name:entry.name,category:entry.category,prompt:entry.prompt};
}
