import {test} from 'node:test';
import assert from 'node:assert/strict';
import {jsonRange} from './inspector.mjs';
import {sectionPaths,mapLayouts} from './selection.mjs';

test('source navigation finds escaped strings, duplicate content and array paths without rewriting text',()=>{
 const document={root:[{type:'text',value:'braces {}, comma, quote " and slash \\'},{box:{children:[{type:'text',value:'braces {}, comma, quote " and slash \\'}]}}]};
 for(const text of [JSON.stringify(document),JSON.stringify(document,null,2),JSON.stringify(document,null,'\t')]){
  const range=jsonRange(text,['root',1,'box','children',0]);assert.deepEqual(JSON.parse(text.slice(range.start,range.end)),document.root[1].box.children[0]);assert.ok(range.start>text.indexOf('braces'));assert.equal(jsonRange(text,['absent']),null);
 }
});
test('section paths preserve typed, shorthand, array and standalone source structures',()=>{
 assert.deepEqual(sectionPaths({root:{column:{children:[{},{}]}}}),[['root','column','children',0],['root','column','children',1]]);
 assert.deepEqual(sectionPaths({root:[{},{}]}),[['root',0],['root',1]]);
 assert.deepEqual(sectionPaths({root:{type:'text',value:'hello'}}),[['root']]);
 assert.deepEqual(sectionPaths({root:{type:'column',children:[]}}),[]);
});
test('source mapping refuses mismatched or unknown layouts instead of guessing a node',()=>{
 const decoded={getRootLayoutComponent:()=>({getList:()=>[]})};
 assert.throws(()=>mapLayouts({root:{type:'canvas',commands:[]}},decoded),/trees differ/);
 assert.throws(()=>mapLayouts({root:{type:'future-layout'}},decoded),/unavailable/);
 assert.deepEqual(mapLayouts({root:{type:'variable',name:'invisible',value:1}},decoded),[]);
});
