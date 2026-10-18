import test from 'node:test';
import assert from 'node:assert/strict';
import * as I from '../importers.js';
import * as E from '../engine.js';
const options={sheet:'UBS',source:'Expediente sintético.xlsx',location:'UBS agrupadas'};
function sheet(){return [...Array.from({length:25},()=>[]),['','PARTIDA','DESCRIPCION','UNID.','VECES','LONG.','ANCHO','ALTURA','SUB-TOTAL','TOTAL'],['','2.01','GRUPO'],['','2.01.01','Limpieza','M²',13,2,3,1,6,78],['','','Detalle','',13,2,3,1,6],['','2.01.02','Tubería','ML',1,12,1,1,12,12]];}
test('Expediente: encabezado posterior a fila 20, TOTAL agregado y trazabilidad sin contar detalles',()=>{
 const rows=sheet(),r=I.engineeringRows(rows,options);assert.equal(I.engineeringHeader(rows).header,25);assert.deepEqual(r.errors,[]);assert.equal(r.rows.length,2);
 assert.equal(r.rows[0].quantity,78);assert.equal(r.rows[0].code,'02.01.01');assert.equal(r.rows[0].sourceRow,28);assert.equal(r.rows[0].rate,null);assert.equal(r.rows[0].sourceScope,'aggregate');assert.equal(r.rows[1].unit,'m');assert.equal(E.normalizeUnit('ML/JORNADA'),'m/jornada');
});
test('Un TOTAL sin caché o con error bloquea la confirmación; no se toma SUB-TOTAL ni cero',()=>{
 for(const value of [null,'#REF!','']){const rows=sheet();rows[27][9]=value;const r=I.engineeringRows(rows,options);assert.equal(r.errors.length,1);assert.equal(r.rows.length,1);assert.match(r.errors[0],/TOTAL/);}
});
test('No se aceptan códigos duplicados ni hojas auxiliares como producción',()=>{
 const rows=sheet();rows.push(rows[27]);assert.match(I.engineeringRows(rows,options).errors[0],/duplicada/);assert.equal(I.engineeringHeader([['Acero','Diametro','Longitud']]),null);assert.throws(()=>I.engineeringRows([['Acero']],options),/principal/);assert.ok(I.engineeringRows(sheet(),{...options,location:''}).errors.length);
});
test('Un vínculo SS o con desfase conserva la referencia y no produce una duración operativa falsa',()=>{
 for(const link of [{id:'EX-01',type:3,lag:0},{id:'EX-01',type:1,lag:-4800}]){const s=E.demoState(),a=s.activities.find(a=>a.id==='TU-01');a.predecessorLinks=[link];const original=[a.start,a.finish],r=E.compute(s).rows.get(a.id);assert.equal(r.s,null);assert.equal(r.f,null);assert.equal(r.ff,null);assert.deepEqual([a.start,a.finish],original);assert.equal(E.readiness(s,a).ready,false);}
});
test('El catálogo APU exige código, descripción y unidad coincidentes y conserva Q y su fuente',()=>{
 const measures=I.engineeringRows(sheet(),options).rows;
 const catalog=[['codigo_partida','descripcion','unidad','rendimiento','fuente'],['02.01.01','LIMPIEZA','m2',20,'APU sintético p. 1'],['02.01.02','Tubería de otra especificación','m',40,'APU sintético p. 2']];
 const r=I.matchRateCatalog(measures,catalog,'prueba.csv');assert.equal(r.rows.length,1);assert.equal(r.rows[0].quantity,78);assert.equal(r.rows[0].rate,20);assert.equal(r.rows[0].rateBasis,'apu-reference');assert.equal(measures[0].rate,null);assert.equal(r.rows[0].quantitySource,measures[0].source);
 assert.equal(I.matchRateCatalog(measures,[...catalog,catalog[1]],'prueba').errors.length,1);
 const incompatible=structuredClone(catalog);incompatible[1][2]='m3';assert.equal(I.matchRateCatalog(measures,incompatible,'prueba').rows.length,0);
});
