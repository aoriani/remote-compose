// Analyze captured native screenshots; does not draw or implement the animations.
import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {createCanvas,loadImage}=require('../upstream/experiments/players/typescript/node_modules/canvas');
const folder=resolve(process.argv[2]||'artifacts/redesign');
const report={};
for(const platform of ['android','ios']){
 report[platform]=[];
 for(const frame of ['a','b']){
  const image=await loadImage(resolve(folder,`${platform}-animation-${frame}.png`));
  const canvas=createCanvas(image.width,image.height),context=canvas.getContext('2d');context.drawImage(image,0,0);
  const data=context.getImageData(0,0,image.width,image.height).data,w=image.width,h=image.height;
  const seen=new Uint8Array(w*h),queue=new Int32Array(w*h),components=[];
  const matches=i=>data[i*4]===48&&data[i*4+1]===91&&data[i*4+2]===239;
  for(let i=0;i<w*h;i++){
   if(seen[i]||!matches(i))continue;
   let head=0,tail=1,minX=w,minY=h,maxX=0,maxY=0;queue[0]=i;seen[i]=1;
   while(head<tail){
    const p=queue[head++],x=p%w,y=Math.floor(p/w);minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);
    for(const next of [p-w,p+w,...(x?[p-1]:[]),...(x<w-1?[p+1]:[])])if(next>=0&&next<w*h&&!seen[next]&&matches(next)){seen[next]=1;queue[tail++]=next;}
   }
   if(tail>8)components.push({pixels:tail,x:minX,y:minY,width:maxX-minX+1,height:maxY-minY+1});
  }
  const dot=components.filter(c=>c.width<40&&c.height<40&&c.x<w*.25&&c.y>h*.2).sort((a,b)=>b.pixels-a.pixels)[0];
  const bar=components.filter(c=>c.width>100&&c.height<30&&c.y>h*.6).sort((a,b)=>b.width-a.width)[0];
  assert.ok(dot&&bar,`${platform}: expected the scrolled member pulse and progress bar`);
  report[platform].push({dot,bar});
 }
 assert.notEqual(report[platform][0].dot.pixels,report[platform][1].dot.pixels,`${platform} pulse must change`);
 assert.notEqual(report[platform][0].bar.width,report[platform][1].bar.width,`${platform} progress must change`);
}
writeFileSync(resolve(folder,'native-animation.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
