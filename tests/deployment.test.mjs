import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {root,runtimeFiles} from '../scripts/build-site.mjs';

test('La fuente /docs de Pages contiene la aplicación completa y actualizada',async()=>{
 for(const name of runtimeFiles){
  const [source,published]=await Promise.all([readFile(resolve(root,name)),readFile(resolve(root,'docs',name))]);
  assert.deepEqual(published,source,`${name}: ejecuta npm run build antes de publicar`);
 }
 const index=await readFile(resolve(root,'docs/index.html'),'utf8');
 assert.match(index,/src="app\.js"/);
 assert.match(index,/href="app\.css"/);
 assert.match(index,/sujeta a modificaciones/);
 assert.equal((await readFile(resolve(root,'docs/.nojekyll'))).length,0);
});
