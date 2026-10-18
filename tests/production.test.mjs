import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../engine.js';
import * as I from '../importers.js';

test('Calendario: media jornada y feriado no se suman como días calendario',()=>{
 const p={origin:'2026-05-04',work:[0,1,1,1,1,1,.5],holidays:['2026-05-05']},c=E.calendar(p);
 assert.equal(c.index('2026-05-11'),4.5);assert.equal(c.date(5,true),'2026-05-11');assert.equal(c.date(4,true),'2026-05-08');
});
test('Q/R, precedencia y pronóstico se recalculan conservando fechas de referencia',()=>{
 const s=E.demoState(),before=s.activities.find(a=>a.id==='TU-01').start;
 assert.equal(E.compute(s).rows.get('EX-01').duration,5);
 const m=s.measures.find(m=>m.code==='TUB'&&m.location==='T-01');m.rate=10;
 const r=E.compute(s).rows.get('TU-01');assert.equal(r.duration,10);assert.equal(s.activities.find(a=>a.id==='TU-01').start,before);assert.ok(r.f>r.s);
});
test('Información faltante y unidades incompatibles no se convierten a cero',()=>{
 const s=E.demoState(),m=s.measures.find(m=>m.code==='TUB'&&m.location==='T-01');m.rate=null;assert.equal(E.compute(s).rows.get('TU-01').duration,null);
 m.rate=20;m.rateUnit='m3';assert.equal(E.durationOf(s,s.activities.find(a=>a.id==='TU-01')),null);
 assert.equal(E.compute(s).rows.get('UB-01').exposure,null);
});
test('Una estimación o evidencia sin revisión no liberan una restricción',()=>{
 const s=E.demoState(),r=s.restrictions[0],a=s.activities.find(a=>a.id==='TU-02');r.estimated='2026-05-04';r.evidence='Documento';r.released='2026-05-09';
 assert.equal(E.isReleased(r,s.project.cut),false);assert.equal(E.readiness(s,a).state,'Bloqueada');
});
test('Preparación se invalida al cambiar metrados y el trabajo bloqueado no entra al plan',()=>{
 const s=E.demoState(),a=s.activities.find(a=>a.id==='TU-01');E.confirmPreparation(s,a.id,'Residente','Frente y recursos verificados');assert.equal(E.readiness(s,a).ready,true);
 const p=E.createPlan(s,'2026-05-11','2026-05-16');assert.throws(()=>E.addCommitment(s,p.id,'TU-02',20,'Entrega'),/no preparada/);
 E.measureOf(s,a).rate=10;assert.equal(E.readiness(s,a).ready,false);
});
function preparedPlan(){const s=E.demoState();E.confirmPreparation(s,'TU-01','Residente','Preparación verificada');const p=E.createPlan(s,'2026-05-11','2026-05-16');E.addCommitment(s,p.id,'TU-01',100,'Tubería instalada y revisada');E.freezePlan(s,p.id);return {s,p};}
test('PPC conserva denominador y exige cantidad y criterio de término',()=>{
 const {s,p}=preparedPlan();assert.throws(()=>E.addCommitment(s,p.id,'EX-02',10,'Entrega'),/congelado/);
 s.project.cut='2026-05-16';assert.throws(()=>E.closeCommitment(s,p.id,'TU-01','cumplido','','',true),/metrado/);
 E.recordProgress(s,{activityId:'TU-01',date:'2026-05-14',quantity:100,accepted:true,evidence:'Registro de campo',reviewer:'Residente'});
 assert.throws(()=>E.closeCommitment(s,p.id,'TU-01','cumplido','','',false),/criterio/);
 E.closeCommitment(s,p.id,'TU-01','cumplido','','',true);assert.equal(E.indicators(s,p).ppc,100);assert.equal(p.members.length,1);
});
test('PRL cuenta una restricción compartida una sola vez y congela su fecha más temprana',()=>{
 const {s,p}=preparedPlan();p.frozenAt=null;s.restrictions.push({id:'COMP',title:'Compartida',owner:'R',estimated:'2026-05-12',links:[{activityId:'RV-01',needed:'2026-05-12'},{activityId:'UB-01',needed:'2026-05-13'}],evidence:'',reviewer:'',released:null});E.freezePlan(s,p.id);
 const r=s.restrictions.at(-1);r.links[0].needed='2026-05-20';r.released='2026-05-13';r.evidence='Cierre';r.reviewer='Responsable';s.project.cut='2026-05-16';
 const k=E.indicators(s,p);assert.equal(k.due,2);assert.equal(k.released,0);assert.equal(p.snapshot.restrictions.find(r=>r.id==='COMP').needed,'2026-05-12');
});
test('Continuidad consolida interrupciones coincidentes dentro de tiempo programado',()=>{
 const {s,p}=preparedPlan();s.project.cut='2026-05-16';s.interruptions.push({activityId:'TU-01',start:'2026-05-12',end:'2026-05-13'},{activityId:'TU-01',start:'2026-05-13',end:'2026-05-14'});
 const k=E.indicators(s,p);assert.equal(k.programmed,4);assert.equal(k.interrupted,3);assert.equal(k.continuity,25);
});
test('Solo la incompatibilidad declarada genera alarma de solape',()=>{
 const s=E.demoState(),a=s.activities.find(a=>a.id==='RV-01'),b={...E.clone(a),id:'RV-02',code:'CON2',crew:'Otra'};s.activities.push(b);s.measures.push({...E.measureOf(s,a),code:'CON2'});
 assert.equal(E.compute(s).overlaps.length,0);a.incompatible=['RV-02'];assert.ok(E.compute(s).overlaps[0].amount>0);
});
test('CSV citado, coma decimal, fecha Excel y duplicados se revisan antes de importar',()=>{
 const rows=I.parseCSV('codigo_partida;ubicacion;metrado;unidad;rendimiento\nTUB;T-01;"10,5";m;2');const mapped=I.mappedRows(rows,I.suggestMapping(rows[0],'measures'),'measures','Archivo de prueba');assert.equal(mapped.rows[0].quantity,10.5);assert.equal(mapped.rows[0].rateUnit,'m');assert.equal(E.normalizeUnit('M³/DÍA'),'m3/dia');
 assert.equal(I.parseDate('04/05/2026'),'2026-05-04');assert.equal(I.parseDate('31/02/2026'),null);assert.throws(()=>I.parseCSV('id;nombre\n1;"sin cierre'),/comillas/);
 const duplicate=I.mappedRows([...rows,rows[1]],I.suggestMapping(rows[0],'measures'),'measures','prueba');assert.ok(duplicate.errors[0].includes('duplicado'));
});
test('Un respaldo inválido no pasa la validación',()=>{const s=E.demoState();assert.equal(E.validateBackup(E.clone(s)).activities.length,8);s.project.work=[0,0,0,0,0,0,0];assert.throws(()=>E.validateBackup(s),/Calendario/);});
test('Revisar el metrado de una predecesora invalida una entrega que ya no cubre el alcance',()=>{const s=E.demoState();assert.equal(E.delivered(s,'EX-01'),true);s.measures.find(m=>m.code==='EXC'&&m.location==='T-01').quantity=120;assert.equal(E.delivered(s,'EX-01'),false);assert.equal(E.readiness(s,s.activities.find(a=>a.id==='TU-01')).state,'Bloqueada');});
test('No se congela retrospectivamente un plan ni se registra producción sin preparación',()=>{const s=E.demoState();E.confirmPreparation(s,'TU-01','R','Frente verificado');const p=E.createPlan(s,'2026-05-11','2026-05-16');E.addCommitment(s,p.id,'TU-01',100,'Entrega');s.project.cut='2026-05-11';assert.throws(()=>E.freezePlan(s,p.id),/antes del inicio/);delete s.activities.find(a=>a.id==='TU-01').preparation;assert.throws(()=>E.recordProgress(s,{activityId:'TU-01',date:'2026-05-11',quantity:20,evidence:'Medición',reviewer:'R'}),/preparación/);});
test('Los días sin registro no se interpretan como producción cero para calcular un rendimiento observado',()=>{const s=E.demoState();E.confirmPreparation(s,'TU-01','R','Preparado');s.project.cut='2026-05-13';E.recordProgress(s,{activityId:'TU-01',date:'2026-05-11',quantity:20,evidence:'Medición',reviewer:'R'});assert.equal(E.compute(s).rows.get('TU-01').rate,null);for(const date of ['2026-05-12','2026-05-13'])E.recordProgress(s,{activityId:'TU-01',date,quantity:20,evidence:'Medición',reviewer:'R'});assert.equal(E.compute(s).rows.get('TU-01').rate,20);});
test('Un hito conserva duración cero y exige confirmación documentada antes de entregar su predecesión',()=>{const s=E.demoState(),a={id:'H1',code:'HITO',name:'Inicio aprobado',location:'Proyecto',component:'Hito',flowGroup:'',order:null,start:'2026-05-11',finish:'2026-05-11',predecessors:[],crew:'',milestone:true};s.activities.push(a);E.confirmPreparation(s,a.id,'R','Condiciones del hito verificadas');s.project.cut='2026-05-11';E.recordMilestone(s,{activityId:'H1',date:'2026-05-11',evidence:'Acta de ejemplo',reviewer:'R'});assert.equal(E.durationOf(s,a),0);assert.equal(E.delivered(s,'H1'),true);assert.equal(E.validateBackup(s),s);});
