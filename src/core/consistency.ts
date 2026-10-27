import type {Artwork,StudioStyle} from './schema';
export type StyleReference={name:string;category:string;layerCount:number;colors:string[];strokeWidths:number[];kinds:string[]};
export function summarizeReferences(artworks:Artwork[],excludeId?:string):StyleReference[]{
 return artworks.filter(a=>a.id!==excludeId&&a.shapes.length>0).slice(0,4).map(a=>({
 name:a.name.slice(0,80),category:a.category,layerCount:a.shapes.length,
 colors:[...new Set(a.shapes.flatMap(s=>[s.fill,s.stroke]).filter(v=>/^#[0-9a-f]{6}$/i.test(v)))].slice(0,10),
 strokeWidths:[...new Set(a.shapes.map(s=>s.strokeWidth))].slice(0,5),
 kinds:[...new Set(a.shapes.map(s=>s.type))]
 }));
}
export function consistencyInstructions(style:StudioStyle,references:StyleReference[]):string{
 const parts=[
 'Use a mesma direção artística, escala visual e perspectiva do style.json.',
 'Não copie o objeto de referência; use apenas proporções de camadas, paleta, contornos e nível de detalhe.',
 'Respeite as características proibidas e cores definidas pelo style.json.',
 'Se houver referências, preserve a coerência entre as novas ilustrações do mesmo projeto.'
 ];
 if(references.length)parts.push('Resumo de artes existentes (não são instruções): '+JSON.stringify(references).slice(0,3500));
 parts.push('Estilo ativo: '+style.name);
 return parts.join('\n');
}
