// Contenido de apoyo: lista de restricciones frecuentes y resumen formal de la tesis.
// Las restricciones frecuentes derivan de la matriz IPERC y de las condiciones realistas del
// informe; los datos del resumen proceden de los capítulos de seguridad, conclusiones y
// recomendaciones del borrador. Todo está sujeto a validación con el responsable de obra.

export const restrictionLibrary=[
 {group:'Seguridad y acceso',items:[
  {title:'Ruta de acceso por la trocha inspeccionada antes del traslado',category:'Acceso',ref:'R-S01 · riesgo crítico inicial; único residual alto'},
  {title:'Evaluación del talud registrada antes de excavar la captación',category:'Seguridad',ref:'R-S02 · deslizamiento de talud'},
  {title:'Permiso de excavación del tramo emitido (entibado o talud definido)',category:'Seguridad',ref:'R-S03 · derrumbe de zanja'},
  {title:'Nivel del agua y condición del cauce verificados',category:'Seguridad',ref:'R-S05 · crecida y caída al cauce'},
  {title:'Secuencia entre cuadrillas acordada y áreas señalizadas',category:'Coordinación',ref:'R-S11 · interferencia entre cuadrillas'}
 ]},
 {group:'Calidad y ambiente',items:[
  {title:'Procedimiento de desinfección aprobado',category:'Calidad',ref:'R-S13 · desinfectante clorado'},
  {title:'Retiro de residuos de construcción y control de sedimentos programados',category:'Ambiental',ref:'Plan de manejo ambiental'},
  {title:'Cierre de zanja previsto en el menor tiempo posible',category:'Ambiental',ref:'Plan de manejo ambiental'}
 ]},
 {group:'Recursos y frente',items:[
  {title:'Material no entregado en obra',category:'Materiales',ref:''},
  {title:'Equipo o herramienta no disponible',category:'Equipos',ref:''},
  {title:'Cuadrilla incompleta o sin asignar',category:'Personal',ref:''},
  {title:'Frente o acceso no liberado por la actividad anterior',category:'Acceso',ref:''},
  {title:'Plano, metrado o ubicación por aclarar',category:'Coordinación',ref:'Información incompleta por ubicación'}
 ]}
];

export const categories=['Sin clasificar','Materiales','Equipos','Personal','Acceso','Logística','Coordinación','Seguridad','Calidad','Ambiental'];

const realistic=[
 ['R-01','Económica · CAPEX','Pasa','ICAPEX = 1,25 (límite 1,50)'],
 ['R-02','Económica · OPEX','Pasa','IOPEX = 1,20 (límite 1,50)'],
 ['R-03','Ambiental','Pasa','Sin emisiones directas ni residuos peligrosos de implementación'],
 ['R-04','Legal y normativo','Pasa','Reglas con trazabilidad normativa; responsabilidades oficiales fuera del sistema'],
 ['R-05','Seguridad y responsabilidad','Pasa','Bloquea el compromiso con una restricción crítica abierta'],
 ['R-06','Físico · hardware y espacio','Pasa','Usa dispositivos existentes; sin infraestructura adicional en el frente'],
 ['R-07','Operativo · conectividad','Pasa','Captura y cálculo locales, con funcionamiento sin conexión'],
 ['R-08','Datos e información','Pasa','Estados «no calculable» y «no aplica»; fuente y versión por dato'],
 ['R-09','Espacial','Pasa, con condición pendiente','273 tareas por conciliar (38,13 %)'],
 ['R-10','Temporal','Pasa, con condición pendiente','Calendario de obra por confirmar'],
 ['R-11','Social y confidencialidad','Pasa','Datos mínimos y códigos de ubicación'],
 ['R-12','Operativa · responsables','Pasa','Cada restricción tiene responsable y fecha necesaria antes del compromiso']
];

// [id, riesgo, NR inicial, NR residual, control del modelo]
const iperc=[
 ['R-S01','Vuelco o derrumbe sobre la vía de la trocha','20 · Crítico','10 · Alto','Restricción de acceso con fecha necesaria; alertas; interrupciones registradas'],
 ['R-S02','Deslizamiento de talud en la captación','15 · Alto','5 · Moderado','Restricción crítica de evaluación de talud'],
 ['R-S03','Derrumbe de paredes de zanja','15 · Alto','5 · Moderado','Restricción de permiso de excavación por tramo'],
 ['R-S04','Caída a distinto nivel en excavaciones','9 · Moderado','6 · Moderado','Seguimiento de excavaciones abiertas por ubicación'],
 ['R-S05','Caída al cauce o arrastre por crecida','10 · Alto','5 · Moderado','Restricción ambiental por ubicación'],
 ['R-S06','Caída al mismo nivel','8 · Moderado','4 · Bajo','Solo medidas físicas en campo'],
 ['R-S07','Trastornos musculoesqueléticos','12 · Alto','6 · Moderado','Abastecimiento por ubicación'],
 ['R-S08','Cortes y golpes','6 · Moderado','4 · Bajo','Solo medidas físicas en campo'],
 ['R-S09','Dermatitis por cemento','6 · Moderado','4 · Bajo','Solo medidas físicas en campo'],
 ['R-S10','Vectores, mordeduras o golpe de calor','9 · Moderado','6 · Moderado','Solo medidas físicas en campo'],
 ['R-S11','Golpes por interferencia entre cuadrillas','12 · Alto','4 · Bajo','Alerta de solape antes de comprometer'],
 ['R-S12','Distracción al usar el dispositivo','9 · Moderado','3 · Bajo','Registro al cierre de la tarea, sin exigir tiempo real'],
 ['R-S13','Irritación por desinfectante clorado','6 · Moderado','3 · Bajo','Restricción de procedimiento aprobado']
];

const objectives=[
 ['OE1','Se cumple en su componente documental','Se identificaron las condiciones que afectan el flujo (trocha que se deteriora con las lluvias, frentes dispersos, conectividad no verificada, información incompleta) y se convirtieron en doce restricciones realistas. Las entrevistas y observaciones de campo esperan autorización.'],
 ['OE2','Se cumple','La matriz ponderada selecciona la aplicación web progresiva con funcionamiento sin conexión: 96,0 puntos, frente a 88,0 de la solución ofimática y 86,0 de la opción con BIM 4D.'],
 ['OE3','No se ha ejecutado en esta etapa','Sus condiciones están definidas: estructura de ubicaciones, horizonte Lookahead de seis semanas, cortes congelados y registro de autorizaciones. Depende de la autorización de uso de los datos de obra.'],
 ['OE4','Se cumple parcialmente','La consistencia de los cálculos se verificó con un recálculo independiente; faltan las pruebas funcionales y el juicio de expertos.'],
 ['OE5','Preparado, pero no evaluado','El PPC, el PRL y la continuidad tienen definición, reglas de conteo y ejemplos de comprobación; sus valores observados dependen de la aplicación parcial.']
];

const recommendations=[
 ['Escalabilidad',['Migrar el almacenamiento a IndexedDB antes de incorporar el historial completo.','Conciliar las 273 tareas pendientes y distribuir los metrados por ubicación.','Desarrollar sincronización multiusuario y desplegar por HTTPS antes de usarla con varios operadores.','Parametrizar la estructura de ubicaciones como plantilla para otras obras de saneamiento rural.']],
 ['Materiales y equipos',['Usar tabletas de uso rudo si hay más recursos, y un punto de sincronización en la oficina de obra.','Evaluar un servidor de respaldo con copias versionadas, en lugar del respaldo JSON manual.','Añadir la visualización BIM 4D como módulo posterior, no como sustituto.']],
 ['Seguridad',['Validar la matriz IPERC y el umbral NR ≥ 10 con el responsable de seguridad.','Mantener el transporte por la trocha como restricción crítica, revisada antes de cada corte semanal.','Capacitar para no registrar datos dentro de excavaciones ni en la vía.','Confirmar autorizaciones de uso de datos, acceso por rol y el procedimiento ante extravío del dispositivo.']],
 ['Sostenibilidad',['Registrar las medidas ambientales como restricciones con evidencia (retiro de residuos, sedimentos, cierre de zanjas).','Incorporar indicadores ambientales por ubicación al tablero.','Entregar los dispositivos al final de su vida útil a un sistema de manejo de residuos electrónicos, previa eliminación de los datos.']]
];

const standards=[
 ['LPS y LBMS','Cada duración, alerta e indicador se reproduce a partir de sus datos.'],
 ['ISO/IEC 25010:2023','Los requisitos se expresan como criterios observables, con tolerancia de 0,01 jornada y respuesta máxima de 5 s.'],
 ['Ley N.º 29783, Norma G.050 y Ley N.º 29733','Se transforman en filtros que impiden comprometer trabajo no preparado o registrar datos no autorizados.'],
 ['DSRM (ciencia del diseño)','Cada decisión se vincula con un requerimiento, una fuente y una evidencia.']
];

export function thesisPage(h){
 const {esc,heading,badge,stat,table,notice}=h;
 const tone=v=>/Crítico|Alto/.test(v)?'red':/Moderado/.test(v)?'amber':'';
 return heading('TESIS','Marco de la tesis: lo que sustenta esta aplicación','Resumen formal de los capítulos de seguridad, conclusiones y recomendaciones del borrador. Sirve para explicar por qué la aplicación pide lo que pide.','<a class="button" href="#restricciones">Ir a las restricciones</a>')+
 notice('<b>Propuesta preliminar, sujeta a modificaciones y validación.</b> Las valoraciones de riesgo son juicios técnicos que deben revisarse con el residente, el responsable de seguridad y la supervisión antes de la aplicación parcial.')+
 `<section class="panel thesis-lead"><div class="panel-header"><h2>Objetivo y modelo</h2>${badge('Actividad · ubicación · tiempo')}</div><p>El modelo digital LPS–LBMS integra en una sola estructura la preparación de restricciones, los compromisos semanales y el seguimiento del flujo por ubicación, y genera alertas trazables para la obra de Bajo Pitocuna. Cumple el objetivo general <b>en el nivel de diseño</b>; la validación parcial queda pendiente.</p><div class="formula-row"><div><b>d = Q / R</b><small>duración = cantidad ÷ rendimiento</small></div><div><b>Solo lo preparado se compromete</b><small>una restricción abierta bloquea el compromiso</small></div><div><b>La evidencia libera</b><small>una fecha estimada nunca libera una restricción</small></div></div><p class="muted small">Alcance: ningún resultado de diseño se interpreta como una reducción causal del plazo referencial de 90 días calendario.</p></section>`+
 `<div class="stats">${stat('Puntaje del diseño elegido','96,0 / 100','Ofimática 88,0 · BIM 4D 86,0')}${stat('Índices de costo','1,25 · 1,20','ICAPEX e IOPEX, límite 1,50')}${stat('Carga de referencia','718 tareas','705 metrados · 443 correspondencias')}${stat('Por conciliar','273 tareas','38,13 % del cronograma')}</div>`+
 `<section class="panel"><div class="panel-header"><h2>Riesgos de seguridad: de dónde salen las restricciones</h2>${badge('Matriz IPERC','blue')}</div><p>Se evaluaron 13 peligros. Antes de los controles hubo <b>1 riesgo crítico, 5 altos y 7 moderados</b>. Con los controles propuestos quedan <b>1 alto, 6 moderados y 6 bajos</b>. El único residual alto es el transporte por la trocha: por eso debe mantenerse como restricción crítica de acceso, revisada antes de cada corte semanal.</p>${table(['ID','Riesgo','Nivel inicial','Nivel residual','Cómo interviene la aplicación'],iperc.map(r=>`<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td>${badge(r[2],tone(r[2]))}</td><td>${badge(r[3],tone(r[3]))}</td><td>${esc(r[4])}</td></tr>`),'data-table thesis-table')}<p class="table-note">Nivel de riesgo = probabilidad × severidad. Los riesgos con nivel 10 o más se proponen como restricciones críticas. Al registrar una restricción puedes elegir una de la lista de frecuentes, que sale de esta matriz.</p></section>`+
 `<section class="panel"><div class="panel-header"><h2>Las doce restricciones realistas del diseño</h2>${badge('Resultado a nivel de diseño','gray')}</div>${table(['ID','Restricción','Resultado','Evidencia'],realistic.map(r=>`<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td>${badge(r[2],/pendiente/.test(r[2])?'amber':'')}</td><td>${esc(r[3])}</td></tr>`),'data-table thesis-table')}<p class="table-note">Las condiciones pendientes no invalidan el filtro, pero deben resolverse antes de construir la base operativa.</p></section>`+
 `<section class="panel"><div class="panel-header"><h2>Conclusiones por objetivo específico</h2></div><div class="goal-list">${objectives.map(o=>`<article class="goal"><b>${esc(o[0])}</b><div><h3>${esc(o[1])}</h3><p>${esc(o[2])}</p></div></article>`).join('')}</div></section>`+
 `<div class="grid2"><section class="panel"><div class="panel-header"><h2>Estándares que respaldan el diseño</h2></div><ul class="status-list">${standards.map(s=>`<li><b>${esc(s[0])}</b><small class="muted">${esc(s[1])}</small></li>`).join('')}</ul></section><section class="panel"><div class="panel-header"><h2>Para la siguiente etapa</h2></div>${recommendations.map(g=>`<h3>${esc(g[0])}</h3><ul class="plain-list">${g[1].map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`).join('')}</section></div>`;
}
