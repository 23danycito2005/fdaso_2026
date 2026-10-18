// Reglas de producción del prototipo. Las fechas son civiles (sin zona horaria).
export const VERSION = 3;
export const clone = value => JSON.parse(JSON.stringify(value));
export const addDays = (date, days) => new Date(Date.parse(date+'T00:00:00Z') + days*86400000).toISOString().slice(0,10);
export const validDate = value => typeof value==='string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
export const key = (code, location) => `${String(code).trim()}::${String(location).trim()}`;
export const uid = prefix => `${prefix}-${globalThis.crypto?.randomUUID?.() || Date.now().toString(36)+Math.random().toString(36).slice(2,8)}`;
export const normalizeUnit = value => String(value||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/³/g,'3').replace(/²/g,'2').replace(/\s/g,'').replace(/^(und|unidad|unidades|ud)$/,'u');
export function calendar(project){
  const origin=project.origin, work=project.work||[0,1,1,1,1,1,1], holidays=new Set(project.holidays||[]), cache=new Map([[origin,0]]);
  const capacity = d => holidays.has(d)?0:Number(work[new Date(d+'T00:00:00Z').getUTCDay()]||0);
  const index = d => {
    if(!validDate(d))return null;if(cache.has(d))return cache.get(d);
    const distance=Math.round((Date.parse(d)-Date.parse(origin))/86400000);if(Math.abs(distance)>36525)throw Error('Fecha fuera del intervalo de calendario admitido (100 años).');
    let t=0;
    if(distance>=0){for(let i=0;i<distance;i++){const at=addDays(origin,i);t+=capacity(at);cache.set(addDays(at,1),t);}}
    else for(let i=-1;i>=distance;i--){const at=addDays(origin,i);t-=capacity(at);cache.set(at,t);}
    return t;
  };
  const date = (t,end=false) => {
    if(!Number.isFinite(t))return null;
    let at=origin, pos=0,target=t-(end&&t!==0?1e-8:0);
    if(target<0){for(let i=0;i<36525;i++){at=addDays(at,-1);pos-=capacity(at);if(capacity(at)>0&&pos<=target)return at;}}
    else for(let i=0;i<36525;i++){const cap=capacity(at);if(cap>0&&target<pos+cap)return at;pos+=cap;at=addDays(at,1);}
    return null;
  };
  return {capacity,index,date,end:d=>index(addDays(d,1)),difference:(a,b)=>index(a)-index(b)};
}
export function measureOf(state,a){return state.measures.find(m=>key(m.code,m.location)===key(a.code,a.location));}
export function quantity(state,id,through=state.project.cut){return state.progress.filter(p=>p.activityId===id&&p.date<=through).reduce((n,p)=>n+p.quantity,0);}
export function delivered(state,id,through=state.project.cut){const a=state.activities.find(a=>a.id===id),m=a&&measureOf(state,a);return Boolean(a&&(a.milestone||m&&quantity(state,id,through)>=m.quantity-1e-8)&&state.progress.some(p=>p.activityId===id&&p.date<=through&&p.accepted));}
export function restrictionsOf(state,id){return state.restrictions.filter(r=>r.links.some(l=>l.activityId===id));}
export function isReleased(r,cut){return Boolean(r.released&&r.released<=cut&&r.evidence?.trim()&&r.reviewer?.trim());}
export function requiredDate(r){return r.links.map(l=>l.needed).filter(validDate).sort()[0]||null;}
export function durationOf(state,a){
  if(a.milestone)return 0;
  const m=measureOf(state,a);if(!m||!Number.isFinite(m.quantity)||m.quantity<0||!Number.isFinite(m.rate)||m.rate<=0||!m.unit||normalizeUnit(m.unit)!==normalizeUnit(m.rateUnit))return null;
  return m.quantity/m.rate;
}
export function mergeIntervals(intervals){
  const sorted=intervals.filter(([s,e])=>Number.isFinite(s)&&Number.isFinite(e)&&e>s).sort((a,b)=>a[0]-b[0]),merged=[];
  for(const [s,e] of sorted){const last=merged.at(-1);if(last&&s<=last[1])last[1]=Math.max(e,last[1]);else merged.push([s,e]);}return merged;
}
export function interrupted(state,id,cal,start,end){return mergeIntervals(state.interruptions.filter(i=>i.activityId===id).map(i=>[Math.max(start,cal.index(i.start)),Math.min(end,cal.end(i.end))])).reduce((n,[s,e])=>n+e-s,0);}
export function compute(state){
  const cal=calendar(state.project),result=new Map(),visiting=new Set(),cutEnd=cal.end(state.project.cut), crewOrder=new Map();
  [...state.activities].sort((a,b)=>a.start.localeCompare(b.start)||a.id.localeCompare(b.id)).forEach(a=>{if(!a.crew)return;const list=crewOrder.get(a.crew)||[];list.push(a.id);crewOrder.set(a.crew,list);});
  function visit(a){
    if(result.has(a.id))return result.get(a.id);
    if(visiting.has(a.id))return {id:a.id,issues:['Ciclo en precedencias o secuencia de cuadrilla'],duration:durationOf(state,a),s:null,f:null,fs:null,ff:null};
    visiting.add(a.id);
    const issues=[],d=durationOf(state,a),m=measureOf(state,a);let s=cal.index(a.start),f=null,fs=s,ff=null;
    if(!validDate(a.start)||!validDate(a.finish)||a.finish<a.start)issues.push('Revisar fechas del cronograma');
    if(!a.location)issues.push('Falta asignar ubicación');
    if(!a.code)issues.push('Falta código de partida');
    if(!a.milestone&&(!a.flowGroup||!Number.isFinite(a.order)))issues.push('Falta grupo LBMS u orden de ubicación');
    if(!a.milestone&&!a.crew)issues.push('Falta asignar cuadrilla');
    if(a.location&&state.activities.some(b=>b.id!==a.id&&key(b.code,b.location)===key(a.code,a.location)))issues.push('Partida–ubicación duplicada: revisa la unidad de control');
    if(a.location&&state.activities.some(b=>b.id!==a.id&&b.location===a.location&&(b.component!==a.component||b.flowGroup!==a.flowGroup||b.order!==a.order)))issues.push('LBS inconsistente para la misma ubicación');
    if(d===null)issues.push(!m?'Falta vincular metrado y rendimiento':'Metrado, rendimiento o unidades incompatibles');
    if(a.importIssues?.length)issues.push(...a.importIssues);
    if(state.project.calendarConfirmed===false)issues.push('Confirmar calendario de obra');
    const dependencies=[...(a.predecessors||[])];
    const crew=crewOrder.get(a.crew)||[],crewIndex=crew.indexOf(a.id);if(crewIndex>0)dependencies.push(crew[crewIndex-1]);
    const depRows=[...new Set(dependencies)].map(id=>{const predecessor=state.activities.find(x=>x.id===id);if(!predecessor){issues.push('Predecesora no encontrada: '+id);return null;}return visit(predecessor);});
    for(const dep of depRows){if(!dep||dep.f===null||dep.issues?.some(i=>i.includes('Ciclo'))){s=null;fs=null;issues.push('Secuencia no calculable');break;}if(s!==null)s=Math.max(s,dep.f);if(fs!==null){if(dep.ff===null)fs=null;else fs=Math.max(fs,dep.ff);}}
    if(s!==null&&d!==null)f=s+d;
    const pending=restrictionsOf(state,a.id).filter(r=>!isReleased(r,state.project.cut));
    let exposure=0;if(pending.some(r=>!validDate(r.estimated)))exposure=null;else if(s!==null&&pending.length)exposure=Math.max(0,...pending.map(r=>cal.index(r.estimated)-s));
    const q=quantity(state,a.id),done=a.milestone?delivered(state,a.id):m&&q>=m.quantity-1e-8&&delivered(state,a.id);
    const logs=state.progress.filter(p=>p.activityId===a.id&&p.date<=state.project.cut).sort((a,b)=>a.date.localeCompare(b.date));
    let realRate=null;
    if(done){fs=logs.length?cal.index(logs[0].date):s;ff=logs.length?cal.end(logs.at(-1).date):f;}
    else if(d!==null&&fs!==null){
      fs=Math.max(fs,cutEnd);
      if(pending.some(r=>!validDate(r.estimated))){fs=null;ff=null;}
      else{
        for(const r of pending)fs=Math.max(fs,cal.index(r.estimated));
        if(q>0&&logs.length){
          const from=cal.index(logs[0].date),elapsed=cutEnd-from-interrupted(state,a.id,cal,from,cutEnd),recorded=new Set(logs.map(p=>p.date));let completeCoverage=true;
          for(let day=logs[0].date;day<=state.project.cut;day=addDays(day,1))if(cal.capacity(day)>0&&!recorded.has(day)&&interrupted(state,a.id,cal,cal.index(day),cal.end(day))<cal.capacity(day)-1e-8){completeCoverage=false;break;}
          if(elapsed>0&&completeCoverage)realRate=q/elapsed;
        }
        const rate=realRate||m?.rate,remaining=Math.max(0,(m?.quantity||0)-q);ff=a.milestone?fs:(rate>0?fs+remaining/rate:null);
      }
    }
    const row={id:a.id,issues:[...new Set(issues)],duration:d,s,f,fs,ff,exposure,quantity:q,done:Boolean(done),rate:realRate,conditional:pending.length>0};result.set(a.id,row);visiting.delete(a.id);return row;
  }
  state.activities.forEach(visit);
  // Solo se señala interferencia cuando la incompatibilidad fue declarada.
  const overlaps=[];
  for(let i=0;i<state.activities.length;i++)for(let j=i+1;j<state.activities.length;j++){
    const a=state.activities[i],b=state.activities[j],x=result.get(a.id),y=result.get(b.id);
    if(a.location&&a.location===b.location&&((a.incompatible||[]).includes(b.id)||(b.incompatible||[]).includes(a.id))&&[x.s,x.f,y.s,y.f].every(Number.isFinite)){
      const amount=Math.max(0,Math.min(x.f,y.f)-Math.max(x.s,y.s));if(amount>0)overlaps.push({a:a.id,b:b.id,amount});
    }
  }
  return {cal,rows:result,overlaps};
}
export function preparationFingerprint(state,a,model=null){const {preparation,...activity}=a;return JSON.stringify({a:activity,m:measureOf(state,a),calendar:[state.project.origin,state.project.work,state.project.holidays,state.project.calendarConfirmed],restrictions:restrictionsOf(state,a.id),predecessors:(a.predecessors||[]).map(id=>[id,quantity(state,id),delivered(state,id)]),overlaps:(model||compute(state)).overlaps.filter(o=>o.a===a.id||o.b===a.id)});}
export function readiness(state,a,model=compute(state)){
  const row=model.rows.get(a.id),reasons=[...row.issues];
  if(row.done)return {state:'Terminada',reasons:[],ready:false};
  const pending=restrictionsOf(state,a.id).filter(r=>!isReleased(r,state.project.cut));if(pending.length)reasons.push(`${pending.length} restricción(es) pendiente(s) de evidencia y revisión`);
  for(const id of a.predecessors||[])if(!delivered(state,id))reasons.push('Entrega de predecesora pendiente: '+id);
  if(model.overlaps.some(o=>o.a===a.id||o.b===a.id))reasons.push('Solape incompatible en la ubicación');
  if(reasons.length)return {state:'Bloqueada',reasons:[...new Set(reasons)],ready:false};
  if(!a.preparation||a.preparation.fingerprint!==preparationFingerprint(state,a,model))return {state:'Por confirmar',reasons:['Confirmar recursos, seguridad, calidad y disponibilidad del frente'],ready:false};
  return {state:'Preparada',reasons:[],ready:true};
}
export function confirmPreparation(state,id,reviewer,note){const a=state.activities.find(a=>a.id===id);if(!a)throw Error('Actividad no encontrada');const r=readiness(state,a);if(r.state==='Bloqueada'||r.state==='Terminada')throw Error(r.reasons.join(' · ')||'Actividad terminada');if(!reviewer?.trim()||!note?.trim())throw Error('Registra responsable y comprobación de preparación');a.preparation={reviewer:reviewer.trim(),note:note.trim(),date:state.project.cut,fingerprint:preparationFingerprint(state,a)};}
export function lookahead(state,weeks=6,model=compute(state)){
  const start=addDays(state.project.cut,1),end=addDays(start,weeks*7-1),lo=model.cal.index(start),hi=model.cal.end(end);
  // El trabajo no terminado con fecha vencida se conserva como arrastre.
  return state.activities.filter(a=>{const r=model.rows.get(a.id);if(r.done)return false;const s=r.s??model.cal.index(a.start);return s!==null&&s<=hi;}).sort((a,b)=>a.start.localeCompare(b.start));
}
export function createPlan(state,start,end){if(!validDate(start)||!validDate(end)||end<start||Date.parse(end)-Date.parse(start)>6*86400000)throw Error('El corte semanal admite de 1 a 7 días');const plan={id:uid('SEM'),start,end,members:[],frozenAt:null,snapshot:null};state.plans.push(plan);return plan;}
export function addCommitment(state,planId,id,target,criterion){
  const plan=state.plans.find(p=>p.id===planId),a=state.activities.find(a=>a.id===id);if(!plan||plan.frozenAt)throw Error('El plan no existe o está congelado');if(plan.members.some(m=>m.activityId===id))throw Error('La actividad ya está en el plan');
  const model=compute(state),r=readiness(state,a,model);if(!r.ready)throw Error('Actividad no preparada: '+r.reasons.join(' · '));
  const m=measureOf(state,a),remaining=(m?.quantity||0)-quantity(state,id);if(!Number.isFinite(target)||target<=0||target>remaining+1e-8)throw Error('El alcance debe ser mayor que cero y no superar el metrado pendiente');if(!criterion?.trim())throw Error('Define el criterio de término');
  const row=model.rows.get(id);if(row.s>model.cal.end(plan.end)||row.f<model.cal.index(plan.start))throw Error('La actividad no coincide con la ventana semanal; revisa su programación');
  plan.members.push({activityId:id,target,criterion:criterion.trim(),title:a.name,location:a.location,unit:m.unit,result:'pendiente',cause:'',action:''});
}
export function freezePlan(state,id){
  const p=state.plans.find(p=>p.id===id);if(!p||p.frozenAt||!p.members.length)throw Error('Se necesita un plan abierto con compromisos');const model=compute(state);
  if(state.project.cut>=p.start||state.progress.some(e=>e.date>=p.start&&e.date<=p.end))throw Error('Congela el plan antes del inicio de la semana y de registrar sus resultados');
  for(const m of p.members){const a=state.activities.find(a=>a.id===m.activityId);if(!readiness(state,a,model).ready)throw Error('La preparación cambió: '+m.title);const q=measureOf(state,a)?.quantity;if(m.target>q-quantity(state,a.id)+1e-8)throw Error('El alcance pendiente cambió: '+m.title);}
  p.snapshot={calendar:clone(state.project),restrictions:state.restrictions.map(r=>({id:r.id,needed:requiredDate(r)})),windows:p.members.map(m=>{const r=model.rows.get(m.activityId);return {activityId:m.activityId,s:r.s,f:r.f};})};
  p.frozenAt=new Date().toISOString();
}
export function recordProgress(state,entry){
  const a=state.activities.find(a=>a.id===entry.activityId),m=a&&measureOf(state,a);if(!a||!m)throw Error('Vincula la actividad con sus metrados antes de registrar avance');
  if(!validDate(entry.date)||entry.date>state.project.cut)throw Error('La fecha debe estar dentro del corte observado');
  const cal=calendar(state.project);if(cal.capacity(entry.date)<=0)throw Error('La fecha no es laborable en el calendario; revisa el registro o el calendario');
  if(interrupted(state,a.id,cal,cal.index(entry.date),cal.end(entry.date))>=cal.capacity(entry.date)-1e-8)throw Error('Hay una interrupción de toda la jornada en esa fecha');
  if(!Number.isFinite(entry.quantity)||entry.quantity<=0||state.progress.filter(p=>p.activityId===a.id).reduce((n,p)=>n+p.quantity,0)+entry.quantity>m.quantity+1e-8)throw Error('La cantidad debe ser positiva y no superar el metrado total');
  const atObservation={...state,project:{...state.project,cut:entry.date}},r=readiness(atObservation,a);
  if(!r.ready||a.preparation?.date>entry.date)throw Error('Confirma preparación y condiciones a la fecha de observación: '+r.reasons.join(' · '));
  if(!entry.evidence?.trim()||!entry.reviewer?.trim())throw Error('Se requieren evidencia y responsable');
  if(entry.accepted&&quantity(state,a.id,entry.date)+entry.quantity<m.quantity-1e-8)throw Error('La entrega total solo se confirma al completar el metrado a esa fecha');
  state.progress.push({...entry,id:uid('AV')});
}
export function recordMilestone(state,entry){
  const a=state.activities.find(a=>a.id===entry.activityId);
  if(!a?.milestone||!validDate(entry.date)||entry.date>state.project.cut||!entry.evidence?.trim()||!entry.reviewer?.trim())throw Error('Revisa hito, fecha, evidencia y responsable');
  const atObservation={...state,project:{...state.project,cut:entry.date}};if(!readiness(atObservation,a).ready||a.preparation.date>entry.date)throw Error('Confirma las condiciones y la preparación a la fecha del hito');
  state.progress.push({...entry,quantity:0,accepted:true,id:uid('HITO')});
}
export function closeCommitment(state,planId,activityId,result,cause,action,confirmed){
  const p=state.plans.find(p=>p.id===planId),m=p?.members.find(m=>m.activityId===activityId);if(!p?.frozenAt||!m)throw Error('Congela el plan antes del cierre');
  if(state.project.cut<p.end)throw Error('El cierre definitivo requiere un corte que incluya el fin de la semana');
  if(result==='cumplido'){
    const achieved=state.progress.filter(e=>e.activityId===activityId&&e.date>=p.start&&e.date<=p.end).reduce((n,e)=>n+e.quantity,0);
    if(achieved+1e-8<m.target||!confirmed)throw Error('Falta metrado ejecutado dentro de la semana o confirmar el criterio de término');
  }else if(result!=='incumplido'||!cause?.trim()||!action?.trim())throw Error('El incumplimiento requiere causa y acción correctiva');
  Object.assign(m,{result,cause:cause||'',action:action||'',closedAt:new Date().toISOString()});
}
export function indicators(state,plan){
  if(!plan?.frozenAt)return {ppc:null,prl:null,continuity:null,committed:0,fulfilled:0,pending:0,due:0,released:0,programmed:0,interrupted:0};
  const committed=plan.members.length,fulfilled=plan.members.filter(m=>m.result==='cumplido').length,pending=plan.members.filter(m=>m.result==='pendiente').length;
  const due=plan.snapshot.restrictions.filter(r=>r.needed&&r.needed>=plan.start&&r.needed<=plan.end),released=due.filter(r=>{const current=state.restrictions.find(x=>x.id===r.id);return current&&isReleased(current,state.project.cut)&&current.released<=r.needed;}).length;
  const cal=calendar(plan.snapshot.calendar),lo=cal.index(plan.start),hi=Math.min(cal.end(plan.end),cal.end(state.project.cut));let programmed=0,stop=0;
  for(const w of plan.snapshot.windows){const start=Math.max(lo,w.s),end=Math.min(hi,w.f);if(end>start){programmed+=end-start;stop+=interrupted(state,w.activityId,cal,start,end);}}
  return {ppc:committed?fulfilled/committed*100:null,prl:due.length?released/due.length*100:null,continuity:programmed?(programmed-stop)/programmed*100:null,committed,fulfilled,pending,due:due.length,released,programmed,interrupted:stop};
}
export function audit(state,action,detail){state.history.unshift({id:uid('H'),at:new Date().toISOString(),actor:state.project.operator||'Operador local',action,detail});state.updatedAt=new Date().toISOString();}
export function validateBackup(s){
  if(!s||s.version!==VERSION||!s.project||!validDate(s.project.origin)||!validDate(s.project.cut))throw Error('Respaldo incompatible o fechas inválidas');
  for(const name of ['activities','measures','restrictions','progress','interruptions','plans','history'])if(!Array.isArray(s[name]))throw Error('Respaldo incompleto: '+name);
  if(!Array.isArray(s.project.work)||s.project.work.length!==7||s.project.work.some(n=>!Number.isFinite(n)||n<0||n>1)||!s.project.work.some(n=>n>0))throw Error('Calendario inválido');
  const ids=new Set();for(const a of s.activities){if(!a.id||ids.has(a.id)||!a.code||!a.name||!validDate(a.start)||!validDate(a.finish)||a.finish<a.start||!Array.isArray(a.predecessors))throw Error('Actividad inválida o duplicada');ids.add(a.id);}
  const mk=new Set();for(const m of s.measures){if(!m.code||!m.location||mk.has(key(m.code,m.location))||!Number.isFinite(m.quantity)||m.quantity<0||(m.rate!==null&&(!Number.isFinite(m.rate)||m.rate<=0)))throw Error('Metrado inválido o duplicado');mk.add(key(m.code,m.location));}
  const restrictionIds=new Set();for(const r of s.restrictions){if(!r.id||restrictionIds.has(r.id)||!Array.isArray(r.links)||!r.links.length||r.links.some(l=>!ids.has(l.activityId)||l.needed&&!validDate(l.needed))||r.estimated&&!validDate(r.estimated)||r.released&&!validDate(r.released))throw Error('Restricción inválida');restrictionIds.add(r.id);}
  for(const p of s.progress)if(!ids.has(p.activityId)||!validDate(p.date)||!Number.isFinite(p.quantity)||p.quantity<0||p.quantity===0&&!(s.activities.find(a=>a.id===p.activityId)?.milestone&&p.accepted))throw Error('Avance inválido');
  for(const i of s.interruptions)if(!ids.has(i.activityId)||!validDate(i.start)||!validDate(i.end)||i.end<i.start)throw Error('Interrupción inválida');
  for(const p of s.plans)if(!p.id||!validDate(p.start)||!validDate(p.end)||p.end<p.start||!Array.isArray(p.members)||p.frozenAt&&(!p.snapshot||!Array.isArray(p.snapshot.restrictions)||!Array.isArray(p.snapshot.windows)||!p.snapshot.calendar)||p.members.some(m=>!ids.has(m.activityId)||!Number.isFinite(m.target)||m.target<=0||!['pendiente','cumplido','incumplido'].includes(m.result)))throw Error('Plan semanal inválido');
  return s;
}
export function emptyState(){return {version:VERSION,project:{name:'Nuevo proyecto',operator:'',mode:'propio',origin:'2026-05-04',cut:'2026-05-10',work:[0,1,1,1,1,1,1],holidays:[],calendarConfirmed:true},activities:[],measures:[],restrictions:[],progress:[],interruptions:[],plans:[],history:[]};}
export function demoState(){
  const s=emptyState();Object.assign(s.project,{name:'Bajo Pitocuna · escenario de prueba',operator:'Responsable de planificación (prueba)',mode:'demo'});
  const rows=[['EX-01','EXC','Excavación de zanja','T-01','Red de agua','Red principal',1,'2026-05-04','2026-05-08',[],'Excavación',100,'m',20],['TU-01','TUB','Instalación de tubería','T-01','Red de agua','Red principal',1,'2026-05-11','2026-05-14',['EX-01'],'Tubería',100,'m',25],['EX-02','EXC','Excavación de zanja','T-02','Red de agua','Red principal',2,'2026-05-11','2026-05-14',['EX-01'],'Excavación',80,'m',20],['TU-02','TUB','Instalación de tubería','T-02','Red de agua','Red principal',2,'2026-05-18','2026-05-21',['EX-02','TU-01'],'Tubería',80,'m',20],['EX-03','EXC','Excavación de zanja','T-03','Red de agua','Red principal',3,'2026-05-18','2026-05-23',['EX-02'],'Excavación',120,'m',20],['TU-03','TUB','Instalación de tubería','T-03','Red de agua','Red principal',3,'2026-05-25','2026-05-30',['EX-03','TU-02'],'Tubería',120,'m',20],['RV-01','CON','Concreto de reservorio','RV-01','Reservorio','Reservorio',1,'2026-05-18','2026-05-22',[],'Concreto',5,'m3',1],['UB-01','UBS','Instalación de UBS','UBS-01','UBS','Unidades sanitarias',1,'2026-05-11','2026-05-14',[],'Sanitaria',1,'u',0.25]];
  for(const [id,code,name,location,component,flowGroup,order,start,finish,predecessors,crew,q,unit,rate]of rows){s.activities.push({id,code,name,location,component,flowGroup,order,start,finish,predecessors,crew,incompatible:[],source:'Cronograma de demostración',milestone:false});s.measures.push({code,location,quantity:q,unit,rate,rateUnit:unit,source:'Metrados de demostración'});}
  s.progress.push({id:'AV-DEMO',activityId:'EX-01',date:'2026-05-08',quantity:100,accepted:true,evidence:'Acta simulada de entrega de zanja',reviewer:'Responsable de prueba'});
  s.restrictions.push({id:'R-001',title:'Entrega de tubería T-02',category:'Logística',owner:'Logística',estimated:'2026-05-20',links:[{activityId:'TU-02',needed:'2026-05-18'}],evidence:'',reviewer:'',released:null}, {id:'R-002',title:'Verificación de acceso a UBS',category:'Acceso',owner:'Responsable técnico',estimated:null,links:[{activityId:'UB-01',needed:'2026-05-11'}],evidence:'',reviewer:'',released:null});
  audit(s,'Escenario de prueba','8 actividades, 8 metrados y 2 restricciones ficticias.');return s;
}
