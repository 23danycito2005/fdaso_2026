// Correspondencia documental. No asigna frentes ni modifica el plan operativo.
import {key,measureOf,normalizeUnit} from './engine.js';
export const normalizedName=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim();
export function budgetCode(state,a){
 if(state.project.datasetId!=='pitocuna-public-2026-10-18'||!a.sourceWBS||a.code!==a.sourceWBS||a.milestone)return null;
 const parts=a.sourceWBS.split('.');if(parts.some(p=>!/^\d+$/.test(p))||Number(parts[0])<2)return null;
 parts[0]=String(Number(parts[0])-1);return parts.map(p=>p.padStart(2,'0')).join('.');
}
const fingerprint=(a,m)=>JSON.stringify([a.id,a.code,a.name,a.componentId,a.sourceWBS,m.code,m.location,m.name,m.componentId,m.quantity,m.unit]);
export function relations(state){
 const result=new Map(),byCode=new Map(),used=new Map();
 for(const m of state.measures){const k=m.componentId+'|'+m.code;byCode.set(k,[...(byCode.get(k)||[]),m]);}
 for(const a of state.activities){
  const operational=measureOf(state,a),review=(state.documentLinks||[]).find(l=>l.activityId===a.id);
  const reviewed=review&&state.measures.find(m=>key(m.code,m.location)===review.measureKey);
  let row;
  if(operational)row={measure:operational,status:'operational',reason:'Código de partida y ubicación coincidentes.'};
  else if(reviewed&&review.fingerprint===fingerprint(a,reviewed))row={measure:reviewed,status:'reviewed',reason:review.note,review};
  else if(a.milestone)row={status:'milestone',reason:'Hito sin cantidad de producción.'};
  else{
   const code=budgetCode(state,a),candidates=code?byCode.get(a.componentId+'|'+code)||[]:[];
   const exact=candidates.filter(m=>normalizedName(m.name)===normalizedName(a.name));
   row=exact.length===1?{measure:exact[0],status:'documental',reason:'Coinciden el código WBS homologado, el componente y la descripción.'}:{status:'pending',reason:review?'La revisión quedó desactualizada: cambiaron datos de la actividad o el metrado.':candidates.length?'El código coincide, pero la descripción difiere.':'No hay correspondencia inequívoca en este componente.',candidates};
   if(review)row={status:'pending',reason:'La revisión quedó desactualizada: revisa los datos modificados.',candidates:reviewed?[reviewed]:[]};
  }
  result.set(a.id,row);
  if(row.measure){const k=key(row.measure.code,row.measure.location);used.set(k,[...(used.get(k)||[]),a.id]);}
 }
 for(const ids of used.values())if(ids.length>1)for(const id of ids){const row=result.get(id);result.set(id,{status:'pending',reason:'Este metrado aparece asociado a más de una tarea. Revisa la distribución de cantidades.',candidates:[row.measure]});}
 return result;
}
export function reviewLink(state,{activityId,measureKey,reviewer,note}){
 const a=state.activities.find(a=>a.id===activityId),m=state.measures.find(m=>key(m.code,m.location)===measureKey);
 if(!a||a.milestone||!m||!a.componentId||a.componentId!==m.componentId)throw Error('Selecciona un metrado del mismo componente.');
 if(!reviewer?.trim()||!note?.trim())throw Error('Registra responsable y criterio de correspondencia.');
 for(const [id,row] of relations(state))if(id!==activityId&&row.measure===m)throw Error('Ese metrado ya corresponde a otra actividad. Revisa el alcance antes de reutilizarlo.');
 if((state.documentLinks||[]).some(l=>l.activityId!==activityId&&l.measureKey===measureKey))throw Error('Ese metrado ya tiene otra revisión.');
 state.documentLinks=(state.documentLinks||[]).filter(l=>l.activityId!==activityId);
 state.documentLinks.push({activityId,measureKey,reviewer:reviewer.trim(),note:note.trim(),at:new Date().toISOString(),fingerprint:fingerprint(a,m)});
}
export function validateRelations(state){
 if(state.documentLinks===undefined)return state;
 if(!Array.isArray(state.documentLinks))throw Error('Correspondencias documentales inválidas');
 const tasks=new Set(),quantities=new Set();
 for(const l of state.documentLinks){const a=state.activities.find(a=>a.id===l.activityId),m=state.measures.find(m=>key(m.code,m.location)===l.measureKey);
  if(!a||!m||a.componentId!==m.componentId||!a.componentId||tasks.has(a.id)||quantities.has(l.measureKey)||!l.reviewer?.trim()||!l.note?.trim()||typeof l.fingerprint!=='string')throw Error('Correspondencia documental inválida');
  tasks.add(a.id);quantities.add(l.measureKey);
 }return state;
}
export const referenceDuration=m=>m&&Number.isFinite(m.quantity)&&m.rate>0&&normalizeUnit(m.unit)===normalizeUnit(m.rateUnit)?m.quantity/m.rate:null;
