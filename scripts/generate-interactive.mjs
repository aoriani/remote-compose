import {promotionalCarousel,localShopping} from '../web-editor/interactive.mjs';
import {writeFile} from 'node:fs/promises';
const document={header:{width:390,height:844,profiles:512,fps:60,contentDescription:'Interactive Common Market — protocol-local state and host actions'},root:{type:'column',modifiers:[{fillMaxSize:1},{background:'#F5F4EF'},{verticalScroll:0}],children:[promotionalCarousel(),localShopping()]}};
await writeFile('samples/interactive-retail.json',JSON.stringify(document,null,2)+'\n');
