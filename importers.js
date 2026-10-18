import {validDate,key,normalizeUnit} from './engine.js';
export const fields={
  schedule:[['id','ID de actividad',true],['code','Código de partida',true],['name','Actividad',true],['location','Ubicación'],['component','Componente'],['flowGroup','Grupo LBMS comparable'],['order','Orden de ubicación'],['start','Inicio de referencia',true],['finish','Fin de referencia',true],['predecessors','Predecesoras (ID|ID)'],['crew','Cuadrilla']],
  measures:[['code','Código de partida',true],['location','Ubicación',true],['quantity','Metrado',true],['unit','Unidad',true],['rate','Rendimiento / jornada'],['rateUnit','Unidad del rendimiento'],['source','Fuente / versión']]
};
const aliases={id:['id','uid','idactividad'],code:['codigopartida','partida','codigo','wbs','edt'],name:['actividad','nombre','tarea','name'],location:['ubicacion','tramo','frente','lbs'],component:['componente','tipo'],flowGroup:['grupoflujo','grupolbms','grupo'],order:['ordenubicacion','orden'],start:['inicio','comienzo','start','fechainicio'],finish:['fin','finish','fechafin','termino'],predecessors:['predecesoras','predecesora','predecessors'],crew:['cuadrilla','recurso'],quantity:['metrado','cantidad','quantity'],unit:['unidad','unit'],rate:['rendimiento','rate'],rateUnit:['unidadrendimiento','rendimientounidad'],source:['fuente','version','source']};
export const headerKey=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function suggestMapping(headers,type){const out={};for(const [field]of fields[type])out[field]=headers.findIndex(h=>(aliases[field]||[]).includes(headerKey(h)));return out;}
export function parseCSV(text){
  text=text.replace(/^\ufeff/,'');const first=text.split(/\r?\n/)[0],delimiter=first.split(';').length>first.split(',').length?';':',';const rows=[];let row=[],cell='',quote=false;
  for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quote&&text[i+1]==='"'){cell+='"';i++;}else if(quote||!cell)quote=!quote;else throw Error('Comillas inesperadas en CSV');}else if(!quote&&c===delimiter){row.push(cell);cell='';}else if(!quote&&(c==='\n'||c==='\r')){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(c=>c.trim()))rows.push(row);row=[];cell='';}else cell+=c;}
  if(quote)throw Error('El CSV tiene comillas sin cerrar');row.push(cell);if(row.some(c=>c.trim()))rows.push(row);if(rows.length<2)throw Error('El archivo necesita encabezados y al menos una fila');return rows;
}
export function parseNumber(v,nullable=false){if(v===null||v===undefined||String(v).trim()==='')return nullable?null:NaN;if(typeof v==='number')return v;let s=String(v).trim();if(s.includes(',')&&s.includes('.'))throw Error('Usa números sin separador de miles');if(s.includes(','))s=s.replace(',','.');return Number(s);}
export function parseDate(value){
  if(value instanceof Date)return value.toISOString().slice(0,10);
  if(typeof value==='number'&&value>20000&&value<73000)return new Date(Date.UTC(1899,11,30)+Math.round(value)*86400000).toISOString().slice(0,10);
  let s=String(value??'').trim().split('T')[0];const m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(m)s=`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;return validDate(s)?s:null;
}
export function mappedRows(rows,mapping,type,source){
  if(rows.length>2001)throw Error('Máximo 2000 filas por importación. Divide el archivo por fase.');
  const out=[],errors=[];const seen=new Set();
  for(const [i,line]of rows.slice(1).entries()){
    if(!line.some(v=>v!==null&&v!==undefined&&String(v).trim()))continue;
    const get=f=>mapping[f]>=0?line[mapping[f]]:null,txt=f=>String(get(f)??'').trim();
    try{
      let row;
      if(type==='schedule'){
        row={id:txt('id'),code:txt('code'),name:txt('name'),location:txt('location'),component:txt('component')||'Sin clasificar',flowGroup:txt('flowGroup'),order:parseNumber(get('order'),true),start:parseDate(get('start')),finish:parseDate(get('finish')),predecessors:txt('predecessors').split('|').map(s=>s.trim()).filter(Boolean),crew:txt('crew'),incompatible:[],source,milestone:false};
        if(!row.id||!row.code||!row.name||!row.start||!row.finish||row.finish<row.start)throw Error('Faltan ID, partida, actividad o fechas válidas');
        if(row.predecessors.includes(row.id))throw Error('Una actividad no puede ser su propia predecesora');
        if(row.order!==null&&(!Number.isFinite(row.order)||row.order<0))throw Error('Orden de ubicación inválido');
      }else{
        row={code:txt('code'),location:txt('location'),quantity:parseNumber(get('quantity')),unit:normalizeUnit(txt('unit')),rate:parseNumber(get('rate'),true),rateUnit:normalizeUnit(txt('rateUnit')).replace(/\/(jornada|dia|d|j)$/,''),source:txt('source')||source};
        if(!row.code||!row.location||!row.unit||!Number.isFinite(row.quantity)||row.quantity<0||row.rate!==null&&(!Number.isFinite(row.rate)||row.rate<=0))throw Error('Revisa partida, ubicación, cantidad ≥ 0 y rendimiento > 0');
        if(row.rate!==null&&!row.rateUnit)row.rateUnit=row.unit;
      }
      const identity=type==='schedule'?row.id:key(row.code,row.location);if(seen.has(identity))throw Error('Identificador duplicado dentro del archivo: '+identity);seen.add(identity);out.push(row);
    }catch(e){errors.push(`Fila ${i+2}: ${e.message}`);}
  }
  return {rows:out,errors};
}
export function parseProjectXML(text,DOMParserClass=globalThis.DOMParser){
  const xml=new DOMParserClass().parseFromString(text,'application/xml');if(xml.getElementsByTagName('parsererror').length)throw Error('XML inválido');
  const nodes=[...xml.getElementsByTagNameNS('*','Task')];if(!nodes.length)throw Error('No se encontraron tareas MS Project');
  const child=(node,name)=>[...node.children].find(c=>c.localName===name)?.textContent?.trim()||'';
  const tasks=nodes.filter(n=>child(n,'UID')!=='0'&&child(n,'Summary')!=='1'),rows=[],errors=[];
  for(const n of tasks){
    const id='MSP-'+child(n,'UID'),start=parseDate(child(n,'Start')),finish=parseDate(child(n,'Finish')),issues=[];
    if(!start||!finish||finish<start){errors.push(`${id}: fechas ausentes o inválidas`);continue;}
    const predecessors=[...n.children].filter(c=>c.localName==='PredecessorLink').map(link=>{
      if(child(link,'Type')!=='1'&&child(link,'Type')!=='')issues.push('MS Project: revisar vínculo distinto de fin–inicio');
      if(Number(child(link,'LinkLag'))!==0)issues.push('MS Project: revisar desfase del vínculo');
      return 'MSP-'+child(link,'PredecessorUID');
    });
    rows.push({id,code:child(n,'WBS')||child(n,'UID'),name:child(n,'Name'),location:'',component:'Sin clasificar',flowGroup:'',order:null,start,finish,predecessors,crew:'',source:'MS Project XML',milestone:child(n,'Milestone')==='1',importIssues:issues});
  }
  if(new Set(rows.map(r=>r.id)).size!==rows.length)errors.push('UID duplicados en el XML');
  if(rows.length>2000)throw Error('Máximo 2000 tareas; divide el archivo por fase');
  return {rows,errors,warnings:['Las tareas resumen no se importan como producción; los hitos se conservan.','Debes asignar código de partida, ubicación, cuadrilla y grupo LBMS antes de preparar el trabajo.','El calendario XML no se aplica automáticamente. Revisa jornadas y feriados en Calendario.','Solo se calculan vínculos fin–inicio sin desfase. Los demás se señalan para revisión manual.']};
}
export function csv(rows){return '\ufeff'+rows.map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(';')).join('\r\n');}
