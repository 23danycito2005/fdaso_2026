import {key,uid} from './engine.js';
import {validateRelations} from './relations.js';
export const disciplines={arquitectura:'Arquitectura',estructura:'Estructuras',sanitaria:'Inst. sanitarias',electrica:'Inst. eléctricas',disposicion:'Disposición final'};
export function related(state,drawing){
 const measures=new Set(drawing?.measureKeys||[]),activities=new Set(drawing?.activityIds||[]);
 return {measures:state.measures.filter(m=>measures.has(key(m.code,m.location))),activities:state.activities.filter(a=>activities.has(a.id)),pins:(state.drawingPins||[]).filter(p=>p.drawingId===drawing?.id)};
}
export function validateDocuments(state){
 validateRelations(state);
 if(!state.components&&!state.drawings&&!state.drawingPins)return state;
 if(!Array.isArray(state.components)||!Array.isArray(state.drawings)||state.drawingPins&&!Array.isArray(state.drawingPins))throw Error('Expediente de planos incompleto');
 const components=new Set(),drawings=new Set(),measures=new Map(state.measures.map(m=>[key(m.code,m.location),m])),activities=new Map(state.activities.map(a=>[a.id,a]));
 for(const c of state.components){if(!c.id||!c.name||components.has(c.id))throw Error('Componente de expediente inválido');components.add(c.id);}
 const path=p=>typeof p==='string'&&/^project\/(?:planos|inputs)\/[a-z0-9_./-]+$/.test(p)&&!p.includes('..');
 const sources=new Set();for(const s of state.sources||[]){if(!s.id||sources.has(s.id)||!path(s.url))throw Error('Fuente de expediente inválida');sources.add(s.id);}
 for(const d of state.drawings){
  if(!d.id||drawings.has(d.id)||!components.has(d.componentId)||!disciplines[d.discipline]||!path(d.preview)||!Array.isArray(d.measureKeys)||!Array.isArray(d.activityIds)||d.measureKeys.some(k=>!measures.has(k)||measures.get(k).componentId!==d.componentId)||d.activityIds.some(id=>!activities.has(id)||activities.get(id).componentId!==d.componentId))throw Error('Referencias de plano inválidas: '+(d.id||''));
  if(d.original&&!path(d.original))throw Error('Ruta de DWG inválida');drawings.add(d.id);
 }
 const pins=new Set();for(const p of state.drawingPins||[]){const d=state.drawings.find(d=>d.id===p.drawingId);if(!p.id||pins.has(p.id)||!d||!d.measureKeys.includes(p.measureKey)||![p.x,p.y].every(n=>Number.isFinite(n)&&n>=0&&n<=1))throw Error('Marca de plano inválida');pins.add(p.id);}
 return state;
}
export function addPin(state,{drawingId,measureKey,x,y}){
 const drawing=state.drawings?.find(d=>d.id===drawingId);
 if(!drawing||!drawing.measureKeys.includes(measureKey))throw Error('La partida debe estar relacionada con este plano');
 if(![x,y].every(n=>Number.isFinite(n)&&n>=0&&n<=1))throw Error('La marca debe quedar dentro del plano');
 state.drawingPins||=[];const pin={id:uid('MARCA'),drawingId,measureKey,x,y};state.drawingPins.push(pin);return pin;
}
export function drawingLinks(state,activityId){return (state.drawings||[]).filter(d=>d.activityIds.includes(activityId));}
const urls=new Map();
export async function previewURL(drawing){
 if(urls.has(drawing.preview))return urls.get(drawing.preview);
 const response=await fetch(drawing.preview);if(!response.ok)throw Error('No se pudo cargar la vista del plano. Inténtalo con conexión.');
 const stream=drawing.preview.endsWith('.gz')?response.body.pipeThrough(new DecompressionStream('gzip')):response.body;
 const blob=await new Response(stream,{headers:{'Content-Type':'image/svg+xml'}}).blob();const url=URL.createObjectURL(blob);urls.set(drawing.preview,url);return url;
}
