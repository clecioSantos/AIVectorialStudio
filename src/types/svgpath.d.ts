declare module 'svgpath' {
 interface SVGPath {
  abs(): SVGPath;
  unarc(): SVGPath;
  unshort(): SVGPath;
  translate(x:number,y:number): SVGPath;
  scale(x:number,y?:number): SVGPath;
  toString(): string;
 }
 export default function svgpath(d:string): SVGPath;
}
