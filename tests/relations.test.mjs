import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as E from '../engine.js';
import * as R from '../relations.js';
import {validateDocuments} from '../documents.js';
const source=()=>JSON.parse(readFileSync(new URL('../project/pitocuna.json',import.meta.url)));
test('Los cruces del expediente conservan la producción y rechazan dimensiones distintas',()=>{
 const s=source(),before=JSON.stringify(s),links=R.relations(s);
 assert.equal([...links.values()].filter(l=>l.status==='documental').length,443);
 assert.equal(links.get('MSP-3').status,'pending'); // cartel 4.80x3.60 versus 3.60x2.40
 assert.equal(links.get('MSP-8').measure.quantity,37.0368);
 assert.equal(R.referenceDuration(links.get('MSP-8').measure),.370368);
 assert.equal(E.durationOf(s,s.activities.find(a=>a.id==='MSP-8')),null);
 assert.equal(JSON.stringify(s),before);
 assert.notEqual(R.normalizedName('TUBO 1/2"'),R.normalizedName('TUBO 12"'));
 s.project.datasetId='otro';assert.equal([...R.relations(s).values()].filter(l=>l.measure).length,0);
});
test('La revisión manual exige componente, responsable, evidencia y una correspondencia exclusiva',()=>{
 const s=source(),a=s.activities.find(a=>a.id==='MSP-3'),m=s.measures[0];
 const input={activityId:a.id,measureKey:E.key(m.code,m.location),reviewer:'Revisor',note:'Diferencia contrastada con fuente corregida para esta prueba.'};
 assert.throws(()=>R.reviewLink(s,{...input,reviewer:''}),/responsable/);
 assert.throws(()=>R.reviewLink(s,{...input,measureKey:E.key(s.measures[2].code,s.measures[2].location)}),/componente/);
 assert.throws(()=>R.reviewLink(s,{...input,measureKey:E.key(s.measures[1].code,s.measures[1].location)}),/otra actividad/);
 R.reviewLink(s,input);assert.equal(R.relations(s).get(a.id).status,'reviewed');
 const restored=validateDocuments(E.validateBackup(JSON.parse(JSON.stringify(s))));
 assert.equal(restored.documentLinks[0].reviewer,'Revisor');
 m.quantity=2;assert.equal(R.relations(s).get(a.id).status,'pending');
 assert.equal(s.progress.length,0);assert.equal(a.location,'');
});
test('Una cantidad no se asigna por duplicado ni cruza componentes de UBS',()=>{
 const s=source(),a=s.activities.find(a=>a.id==='MSP-8');
 s.activities.push({...a,id:'DUPLICADA'});const links=R.relations(s);
 assert.equal(links.get(a.id).status,'pending');assert.equal(links.get('DUPLICADA').status,'pending');
 const other=source();other.activities.find(a=>a.id==='MSP-8').componentId='ubs-inicial';
 assert.equal(R.relations(other).get('MSP-8').status,'pending');
});
test('Los respaldos rechazan relaciones rotas y referencias ajenas',()=>{
 const s=source();s.documentLinks=[{activityId:'MSP-8',measureKey:'inexistente'}];
 assert.throws(()=>validateDocuments(s),/inválida/);
 const m=source().measures[0];s.documentLinks=[{activityId:'MSP-8',measureKey:E.key(m.code,m.location),reviewer:'R',note:'nota',fingerprint:'x'}];
 assert.throws(()=>validateDocuments(s),/inválida/);
});
