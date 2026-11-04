import {initialDocument} from '../web-editor/model.mjs';
import {writeFile} from 'node:fs/promises';
await writeFile('samples/interactive-retail.json',JSON.stringify(initialDocument(),null,2)+'\n');
