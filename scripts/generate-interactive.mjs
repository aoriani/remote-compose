import {initialDocument} from '../web-editor/model.mjs';
import {writeFile} from 'node:fs/promises';
for(const path of ['samples/retail-home.json','samples/interactive-retail.json'])await writeFile(path,JSON.stringify(initialDocument(),null,2)+'\n');
