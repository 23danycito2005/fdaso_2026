import * as E from './engine.js';

export function practiceState(){
 const state=E.demoState();
 state.project.name='Pitocuna · prueba guiada con datos ficticios';
 state.restrictions.push(
  {id:'R-003',title:'Revisar protección y acceso seguro al reservorio',category:'Seguridad',owner:'Supervisor de seguridad (ficticio)',estimated:'2026-05-19',links:[{activityId:'RV-01',needed:'2026-05-18'}],evidence:'',reviewer:'',released:null},
  {id:'R-004',title:'Acceso a excavación T-01 verificado · ejemplo liberado',category:'Acceso',owner:'Responsable de campo (ficticio)',estimated:'2026-05-07',links:[{activityId:'EX-01',needed:'2026-05-08'}],evidence:'Acta ficticia para demostrar una liberación documentada.',reviewer:'Revisor ficticio',released:'2026-05-07'}
 );
 for(const a of state.activities){a.crew+=' (ficticia)';a.source='Escenario ficticio de práctica';}
 for(const id of ['TU-01','EX-02'])E.confirmPreparation(state,id,'Revisor ficticio','Revisión simulada de recursos, ubicación y condiciones. No representa una autorización de obra.');
 const plan=E.createPlan(state,'2026-05-11','2026-05-16');
 E.addCommitment(state,plan.id,'TU-01',100,'Ejemplo ficticio: instalar y revisar 100 m en T-01.');
 E.addCommitment(state,plan.id,'EX-02',80,'Ejemplo ficticio: completar y revisar 80 m de zanja en T-02.');
 E.freezePlan(state,plan.id);
 E.audit(state,'Prueba guiada','Datos ficticios: 8 actividades, 4 restricciones, cuadrillas y 2 compromisos semanales.');
 return E.validateBackup(state);
}

export function emptyPracticeState(){
 const state=E.emptyState();
 Object.assign(state.project,{name:'Prueba vacía · sin registros',mode:'demo',operator:'Responsable de prueba'});
 E.audit(state,'Prueba vacía','Espacio ficticio sin actividades, metrados, restricciones, ejecución ni compromisos.');
 return state;
}
