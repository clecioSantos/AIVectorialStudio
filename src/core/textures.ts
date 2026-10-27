export type TextureKind='wood'|'metal'|'stone'|'fabric';
export type TextureSettings={kind:TextureKind;scale:number;intensity:number};
export const texturePresets:{kind:TextureKind;label:string}[]=[{kind:'wood',label:'Madeira'},{kind:'metal',label:'Metal escovado'},{kind:'stone',label:'Pedra'},{kind:'fabric',label:'Tecido'}];
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]||c));
export function texturePatternId(settings:TextureSettings):string {
 return 'tx-'+settings.kind+'-'+Math.round(settings.scale*100)+'-'+Math.round(settings.intensity*100);
}
export function texturePattern(settings:TextureSettings):string {
 const size=Math.max(8,Math.min(128,24*settings.scale));
 const opacity=Math.max(0,Math.min(.65,settings.intensity*.35));
 const id=texturePatternId(settings),s=Number(size.toFixed(3)),o=Number(opacity.toFixed(3));
 const motifs:Record<TextureKind,string>={
 wood:'<path d="M 2 4 Q 7 7 12 4 T 22 4 M 5 14 Q 11 11 17 14 M 1 21 Q 9 18 15 21" fill="none" stroke="#221409" stroke-width=".9"/>',
 metal:'<path d="M 1 5 H 22 M 5 12 H 18 M 2 19 H 21" fill="none" stroke="#FFFFFF" stroke-width=".8"/>',
 stone:'<path d="M 0 8 L 6 10 L 10 15 M 15 0 L 17 6 L 23 8 M 10 24 L 12 20 L 18 18" fill="none" stroke="#1B2330" stroke-width="1"/>',
 fabric:'<path d="M 0 6 H 24 M 0 18 H 24 M 6 0 V 24 M 18 0 V 24" fill="none" stroke="#1B2330" stroke-width=".6"/>'
 };
 return '<pattern id="'+esc(id)+'" width="'+s+'" height="'+s+'" patternUnits="userSpaceOnUse" viewBox="0 0 24 24"><g opacity="'+o+'">'+motifs[settings.kind]+'</g></pattern>';
}
export function textureDefs(settings:TextureSettings[]):string{
 const unique=new Map(settings.map(s=>[texturePatternId(s),s]));
 return '<defs>'+[...unique.values()].map(texturePattern).join('')+'</defs>';
}
