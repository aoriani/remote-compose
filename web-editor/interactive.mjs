// Authoring factories only. All runtime behavior below is upstream primitive JSON.
const p=(color,size,alpha=1)=>({type:'paint',ops:[{shader:0},{style:'fill'},{color},{alpha},...(size?[{textSize:size}]:[])]});
const txt=(text,x,y,size,color)=>[p(color,size),{type:'drawTextAnchored',text,x,y,panX:-1,panY:0}];
const variable=(name,value)=>({type:'variable',name,value,export:true});
const expr=(targetId,value)=>({type:'ValueFloatExpressionChange',targetId:'@'+targetId,value});
const host=(name,value,actionType=2)=>({type:'HostAction',name,value,actionType});
export function promotionalCarousel(slideCount=3){
 const vars=[['promo_interval',5],['promo_duration',.45],['promo_base',0],['promo_from',0],['promo_epoch',0],['promo_clock','animationTime() + time * 0'],['promo_elapsed','max(0, @promo_clock - @promo_epoch)'],['promo_step','floor(@promo_elapsed / @promo_interval)'],['promo_auto_t','min(1, max(0, (@promo_elapsed % @promo_interval - @promo_interval + @promo_duration) / @promo_duration))'],['promo_manual_t','min(1, @promo_elapsed / @promo_duration)'],['promo_position','@promo_base + @promo_step + @promo_auto_t * @promo_auto_t * (3 - 2 * @promo_auto_t) + (@promo_from - @promo_base) * (1 - @promo_manual_t * @promo_manual_t * (3 - 2 * @promo_manual_t))'],['promo_active','(floor(@promo_position + 0.5) % @promo_count + @promo_count) % @promo_count'],['promo_dots',1],['promo_arrows',1],['promo_count',slideCount]];
 const defaults=[['oat-milk','BETTER EVERY MORNING','Your daily ritual,','made delicious.','Plant-based favorites. Member prices.','Explore breakfast','#E7EDDF','#263D2F'],['citrus-soda','A LITTLE MORE SUNSHINE','Bring home','the bright side.','Small-batch fizz. Big citrus energy.','Discover Sol','#F8E1CA','#68391F'],['granola','GOOD THINGS IN STORE','Slow mornings.','Golden moments.','Meet your new pantry essentials.','Shop the pantry','#EAE0F0','#503264']];
 const slides=Array.from({length:slideCount},(_,i)=>defaults[i%defaults.length]);
 const commands=[{type:'save'},{type:'clipRect',left:20,top:0,right:'windowWidth() - 20',bottom:258}];
 for(const [i,[asset,kicker,title,line,body,cta,bg,ink]] of slides.entries()){
  commands.push({type:'save'},{type:'translate',dx:`(((${i} - @promo_position + @promo_count * 1.5) % @promo_count + @promo_count) % @promo_count - @promo_count * 0.5) * (windowWidth() - 40)`,dy:0},p(bg),{type:'drawRoundRect',left:20,top:0,right:'windowWidth() - 20',bottom:258,rx:20,ry:20},...txt(kicker,40,28,9,ink),...txt(title,40,67,25,ink),...txt(line,40,98,25,ink),...txt(body,40,126,10,ink),{type:'addBitmap',image:asset,varName:`promo_art_${i}`},{type:'drawBitmap',image:`@promo_art_${i}`,left:'windowWidth() - 160',top:118,right:'windowWidth() - 28',bottom:250},p(ink),{type:'drawRoundRect',left:40,top:166,right:205,bottom:210,rx:22,ry:22},...txt(cta,55,189,12,'#FFFFFF'),{type:'restore'});
 }
 commands.push({type:'restore'});
 const navigate=(target,name)=>[expr('promo_from','@promo_position'),expr('promo_base',target),expr('promo_epoch','@promo_clock'),host('carousel.'+name,'@promo_base',0)];
 const control=(width,draw,actions)=>({type:'canvas',modifiers:[{width},{height:48},{onClick:actions}],commands:draw});
 const arrow=(forward)=>control('48 * @promo_arrows',[p('#203B73',undefined,'@promo_arrows'),{type:'drawCircle',cx:24,cy:24,radius:20},p('#FFFFFF',20,'@promo_arrows'),{type:'drawTextAnchored',text:forward?'›':'‹',x:24,y:23,panX:0,panY:0}],navigate(`floor(@promo_position + 0.5) ${forward?'+':'-'} 1`,forward?'next':'previous'));
 const controls={type:'row',modifiers:[{fillMaxWidth:1},{height:56},{padding:[20,4,20,4]}],children:[arrow(false),{type:'spacer',modifiers:[{horizontalWeight:1}]},...slides.map((_,i)=>control('min(44, (windowWidth() - 136) / @promo_count) * @promo_dots',[p('#305BEF',undefined,`@promo_dots * (1 - min(1, abs(@promo_active - ${i})))`),{type:'drawCircle',cx:'min(44, (windowWidth() - 136) / @promo_count) / 2',cy:24,radius:5},p('#AEB9BC',undefined,`@promo_dots * min(1, abs(@promo_active - ${i}))`),{type:'drawCircle',cx:'min(44, (windowWidth() - 136) / @promo_count) / 2',cy:24,radius:4}],navigate(`floor(@promo_position + 0.5) + ((${i} - @promo_active + @promo_count) % @promo_count)`,'select'))),{type:'spacer',modifiers:[{horizontalWeight:1}]},arrow(true)]};
 return {type:'column',modifiers:[{fillMaxWidth:1}],children:[...vars.map(([n,v])=>variable(n,v)),{type:'canvas',modifiers:[{fillMaxWidth:1},{height:258},{onClick:host('promotion.open','@promo_active',0)}],commands},controls]};
}
export function carouselFields(node){
 const fields=[];const names=['Rotation interval (seconds)','Slide duration (seconds)'];
 for(let i=0;i<2;i++)fields.push({label:names[i],path:['children',i,'value'],type:'number',value:node.children[i].value});
 for(const [index,label] of [[12,'Show position indicators (0 or 1)'],[13,'Show arrow controls (0 or 1)']])fields.push({label,path:['children',index,'value'],type:'number',value:node.children[index].value});
 fields.push({label:'Number of slides (2–5)',path:['children',14,'value'],type:'number',value:node.children[14].value,options:{kind:'carousel-count'}});
 const commands=node.children[15].commands;
 commands.forEach((c,i)=>{if(c.type==='paint'){const j=c.ops.findIndex(x=>Object.hasOwn(x,'color'));if(j>=0)fields.push({label:`Slide ${Math.floor((i-2)/19)+1} · color`,path:['children',15,'commands',i,'ops',j,'color'],type:'text',value:c.ops[j].color});}if(c.type==='drawTextAnchored')fields.push({label:`Slide ${Math.floor((i-2)/19)+1} · text`,path:['children',15,'commands',i,'text'],type:'text',value:c.text});if(c.type==='addBitmap')fields.push({label:`Banner illustration`,path:['children',15,'commands',i,'image'],type:'asset',value:c.image});});
 const controls=node.children[16].children;
 fields.push({label:'Promotion action identifier',path:['children',15,'modifiers',2,'onClick','name'],type:'text',value:node.children[15].modifiers[2].onClick.name});
 controls.forEach((c,i)=>{if(c.type==='canvas'){const a=c.modifiers.find(m=>m.onClick)?.onClick;if(a)fields.push({label:'Control action identifier',path:['children',16,'children',i,'modifiers',2,'onClick',3,'name'],type:'text',value:a[3].name});}});
 return fields;
}

export function localShopping(){
 const controls=(draw,actions,width=64)=>({type:'canvas',modifiers:[{width},{height:52},{onClick:actions}],commands:draw});
 const shape=(color,x,y,r,alpha=1)=>[p(color,undefined,alpha),{type:'drawCircle',cx:x,cy:y,radius:r}];
 const heart='M 28 37 C 26 35 13 27 13 20 C 13 12 24 10 28 17 C 32 10 43 12 43 20 C 43 27 30 35 28 37 Z';
 return {type:'column',modifiers:[{fillMaxWidth:1},{padding:[20,8,20,16]}],children:[variable('shop_favorite',0),variable('shop_quantity',0),variable('shop_category',0),variable('shop_quantity_text',{type:'textFromFloat',value:'@shop_quantity',decimal:0,whole:1,flags:0}),{type:'text',value:'Your everyday, your way',fontSize:23,color:'#182C38',modifiers:[{padding:[0,8,0,12]}]},
 {type:'row',modifiers:[{fillMaxWidth:1},{height:52}],children:['All','Breakfast','Pantry'].map((name,i)=>controls([p('#E5EBDD'),{type:'drawRoundRect',left:0,top:4,right:96,bottom:48,rx:22,ry:22},p('#203B73',undefined,`1 - min(1, abs(@shop_category - ${i}))`),{type:'drawRoundRect',left:0,top:4,right:96,bottom:48,rx:22,ry:22},p('#182C38',12),{type:'drawTextAnchored',text:name,x:48,y:26,panX:0,panY:0},p('#FFFFFF',12,`1 - min(1, abs(@shop_category - ${i}))`),{type:'drawTextAnchored',text:name,x:48,y:26,panX:0,panY:0}],[expr('shop_category',`${i} + 0`),host('category.select',name)],104))},
 {type:'row',modifiers:[{fillMaxWidth:1},{height:146}],children:[{type:'canvas',modifiers:[{width:136},{height:146},{onClick:host('product.open','field-oat')}],commands:[p('#E7EDDF'),{type:'drawRoundRect',left:0,top:8,right:126,bottom:138,rx:18,ry:18},{type:'addBitmap',image:'oat-milk',varName:'shop_oat'},{type:'drawBitmap',image:'@shop_oat',left:0,top:8,right:126,bottom:134}]},{type:'column',modifiers:[{horizontalWeight:1},{padding:[8,20,0,0]}],children:[{type:'text',value:'FIELD / OAT',fontSize:10,color:'#616D77'},{type:'text',value:'Barista oat drink',fontSize:16,color:'#182C38',modifiers:[{onClick:host('product.open','field-oat')}]},{type:'text',value:'1 L · Plant based',fontSize:11,color:'#616D77'},{type:'text',value:'$3.49',fontSize:23,color:'#182C38'}]}]},
 {type:'row',modifiers:[{fillMaxWidth:1},{height:52}],children:[controls([...shape('#EEE7F5',28,26,23),p('#7D4775',undefined,.3),{type:'drawPath',path:heart},p('#A7286D',undefined,'@shop_favorite'),{type:'drawPath',path:heart}],[expr('shop_favorite','1 - @shop_favorite'),host('favorite.change','@shop_favorite',0)],64),{type:'spacer',modifiers:[{horizontalWeight:1}]},controls([...shape('#E5EBDD',24,26,22),...txt('−',17,26,22,'#203B73')],[expr('shop_quantity','max(0, @shop_quantity - 1)'),host('cart.quantity','@shop_quantity',0)],48),{type:'canvas',modifiers:[{width:48},{height:52}],commands:[p('#203B73',22),{type:'drawTextAnchored',text:'@shop_quantity_text',x:24,y:26,panX:0,panY:0}]},controls([...shape('#203B73',24,26,22),...txt('+',17,26,22,'#FFFFFF')],[expr('shop_quantity','min(99, @shop_quantity + 1)'),host('cart.add','@shop_quantity',0)],48)]},
 {type:'text',value:'Scan & Go  →',fontSize:17,color:'#305BEF',modifiers:[{padding:[0,16,0,16]},{onClick:host('scan.open','scan-and-go')}]},{type:'text',value:'Explore your member benefits  →',fontSize:14,color:'#203B73',modifiers:[{padding:[0,12,0,12]},{onClick:host('membership.open','common-market')}]}]};
}

export function moveCarouselSlide(node,index,delta){
 const commands=node.children[15].commands, n=node.children[14].value,target=index+delta;
 if(target<0||target>=n)return;
 const blocks=Array.from({length:n},(_,i)=>commands.slice(2+i*19,2+(i+1)*19));
 [blocks[index],blocks[target]]=[blocks[target],blocks[index]];
 blocks.forEach((block,i)=>{block[12].varName=`promo_art_${i}`;block[13].image=`@promo_art_${i}`;block[1].dx=`(((${i} - @promo_position + @promo_count * 1.5) % @promo_count + @promo_count) % @promo_count - @promo_count * 0.5) * (windowWidth() - 40)`;});
 node.children[15].commands=[...commands.slice(0,2),...blocks.flat(),commands.at(-1)];
}
