import{writeFile}from'node:fs/promises';
import{initialDocument,createWidget}from'../web-editor/model.mjs';
const paint=color=>({type:'paint',ops:[{shader:0},{style:'fill'},{color}]}),text=(value,fontSize=18)=>({type:'text',value,fontSize,color:'#182C38',modifiers:[{padding:16}]});
const source={header:{width:390,height:844,profiles:512,fps:60,contentDescription:'Responsive viewport and native integration regression'},root:{type:'column',modifiers:[{fillMaxSize:1},{background:'#F5F4EF'},{verticalScroll:0}],children:[
 {type:'canvas',modifiers:[{fillMaxWidth:1},{height:200},{onClick:{type:'HostAction',actionId:501}}],commands:[paint('#203B73'),{type:'drawRect',left:0,top:0,right:'windowWidth()',bottom:200},paint('#81A884'),{type:'drawCircle',cx:60,cy:80,radius:20},paint('#F7B07B'),{type:'drawRoundRect',left:'windowWidth() - 140',top:30,right:'windowWidth() - 20',bottom:150,rx:16,ry:16},{type:'addBitmap',image:'oat-milk',varName:'calibrationPhoto'},{type:'drawBitmap',image:'@calibrationPhoto',left:'windowWidth() - 130',top:40,right:'windowWidth() - 30',bottom:140},paint('#FFFFFF'),{type:'drawPath',path:'M 30 160 C 10 140 20 120 30 136 C 40 120 50 140 30 160 Z'}]},
 text('Measured at the available viewport',24),
 {type:'row',modifiers:[{fillMaxWidth:1},{height:120}],children:[{type:'column',modifiers:[{weight:1},{background:'#E8EDDD'}],children:[text('Nested column',14),text('Small text',12)]},{type:'column',modifiers:[{weight:1},{background:'#EEE7F5'}],children:[text('Large text',30)]}]},
 createWidget('products'),...Array.from({length:8},(_,i)=>({...text('Scrolling section '+(i+1),22),modifiers:[{fillMaxWidth:1},{height:100},{background:i%2?'#E8EDDD':'#EEE7F5'},{padding:16}]})),createWidget('button')
]}};
await writeFile('samples/viewport-layout.json',JSON.stringify(source,null,2)+'\n');
const updated=structuredClone(source);updated.header.contentDescription='Second publication: no client rebuild';updated.root.children[0].commands[0]=paint('#305BEF');updated.root.children[1].value='Updated server composition';await writeFile('samples/viewport-layout-updated.json',JSON.stringify(updated,null,2)+'\n');
await writeFile('samples/retail-home.json',JSON.stringify(initialDocument(),null,2)+'\n');
