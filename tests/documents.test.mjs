import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import * as E from '../engine.js';import * as D from '../documents.js';
const source=()=>JSON.parse(readFileSync(new URL('../project/pitocuna.json',import.meta.url)));
test('El expediente publicado conserva cantidades, fuentes, 15 CAD y ausencia de resultados inventados',()=>{
 const s=source();E.validateBackup(s);D.validateDocuments(s);assert.equal(s.activities.length,718);assert.equal(s.measures.length,705);assert.equal(s.drawings.length,15);assert.equal(s.measures.filter(m=>m.rate!==null).length,514);assert.equal(s.progress.length,0);assert.equal(s.plans.length,0);assert.ok(s.activities.every(a=>a.location===''));assert.equal(s.project.calendarConfirmed,false);
 const m=s.measures.find(m=>m.rawCode==='02.01.01.01.01.01'&&m.componentId==='ubs-viviendas');assert.equal(m.quantity,95.03);
});
test('La especialidad eléctrica de primaria no se mezcla con sanitarias aunque el prefijo del Excel sea sanitario',()=>{
 const s=source(),electrical=s.drawings.find(d=>d.id==='pri_electrica'),sanitary=s.drawings.find(d=>d.id==='pri_sanitaria');const q=D.related(s,electrical);assert.equal(q.measures.length,5);assert.ok(q.measures.every(m=>m.code.startsWith('02.03.01.03.04.')));assert.ok(electrical.measureKeys.every(k=>!sanitary.measureKeys.includes(k)));assert.equal(q.activities.length,5);
});
test('Se rechazan marcas fuera de plano o de otro componente; una marca válida no modifica producción',()=>{
 const s=source(),d=s.drawings.find(d=>d.id==='viv_arquitectura');assert.throws(()=>D.addPin(s,{drawingId:d.id,measureKey:'inexistente',x:.5,y:.5}),/relacionada/);assert.throws(()=>D.addPin(s,{drawingId:d.id,measureKey:d.measureKeys[0],x:2,y:.5}),/dentro/);const old=E.clone(s.progress);D.addPin(s,{drawingId:d.id,measureKey:d.measureKeys[0],x:.4,y:.6});D.validateDocuments(s);assert.equal(s.drawingPins.length,1);assert.deepEqual(s.progress,old);
});
test('Los respaldos con enlaces rotos o rutas externas no se aceptan',()=>{
 for(const mutate of [s=>s.drawings[0].preview='https://example.com/plano.svg',s=>s.drawings[0].measureKeys.push('otro::frente'),s=>s.drawings[0].activityIds.push('fantasma'),s=>s.sources[0].url='javascript:alert(1)']){const s=source();mutate(s);assert.throws(()=>D.validateDocuments(s),/inválid/);}
});
