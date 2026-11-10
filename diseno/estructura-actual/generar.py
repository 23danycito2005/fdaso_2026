from pathlib import Path
import xml.etree.ElementTree as X
import html,textwrap,json,subprocess,zipfile
out=Path(__file__).parent
pages=[]
class Page:
 def __init__(self,title,subtitle):self.title=title;self.subtitle=subtitle;self.nodes=[];self.edges=[];pages.append(self)
 def node(self,id,title,lines,x,y,w,h,color='white',kind='box'):
  self.nodes.append(dict(id=id,title=title,lines=lines,x=x,y=y,w=w,h=h,color=color,kind=kind));return id
 def edge(self,a,b,label='',via=None,dash=False):self.edges.append(dict(a=a,b=b,label=label,via=via,dash=dash))
colors={'white':('#fff','#b6c8bf'),'green':('#e5f3e9','#398267'),'blue':('#eaf2fc','#5980ae'),'amber':('#fff3da','#b38b3d'),'gray':('#f2f5f4','#bdccc5'),'purple':('#f2edfa','#8e78b4')}
p=Page('01 · Mapa de pantallas','Estructura existente · Las agrupaciones reproducen el menú actual; no son una propuesta de cambio.')
p.node('A00','PITOCUNA · Aplicación de tesis',['Propuesta preliminar, sujeta a modificaciones y validación.'],40,100,1620,75,'green')
p.node('S00','Selector superior · siempre visible',['Mis datos: proyecto guardado.  |  Prueba vacía: sin registros.  |  Valores predeterminados: ejemplo ficticio.', 'La opción activa y los contadores se muestran arriba. Mis datos y prueba se guardan por separado.'],40,195,1620,105,'amber')
p.node('G01','RESUMEN',[],40,330,330,50,'gray','group')
p.node('M01','Resumen del proyecto',['Pendientes y estado general.','Acceso a actividades y componentes.','Revisar ubicación y calendario.'],40,400,330,155,'green')
p.node('G02','MENÚ · PREPARAR Y EJECUTAR',[],400,330,780,50,'gray','group')
for id,title,lines,x,y in [
 ('M02','Actividades',['Buscar y filtrar por componente.','Ficha: cronograma + Q/R + APU,','planos, restricciones y compromisos.'],400,400),
 ('M03','Lookahead',['Ventana de 3, 4, 6 u 8 semanas.','Revisar condiciones y restricciones.','Confirmar preparación cuando procede.'],800,400),
 ('M04','Restricciones',['Problema, responsable y fecha necesaria.','Abierta / en revisión / liberada.','Evidencia y revisión para liberar.'],400,590),
 ('M05','Plan semanal',['Actividad preparada + cantidad + criterio.','Borrador → congelar → evaluar.','Conserva los compromisos del corte.'],800,590),
 ('M06','Registro de avance',['Cantidades diarias y evidencia.','Confirmación de entrega completa.','Interrupciones con fechas y causa.'],400,780),
 ('M07','Indicadores',['PPC, PRL y continuidad.','Reporte CSV, fórmulas e historial.','Resultados a partir de registros.'],800,780)]:p.node(id,title,lines,x,y,380,160,'blue')
p.node('G03','MENÚ · EXPEDIENTE Y CONFIGURACIÓN',[],1210,330,450,50,'gray','group')
p.node('M08','Visualización de obra',['Un mismo espacio para consultar','planos y flujo por componente.'],1210,400,450,100,'purple')
p.node('M08A','Planos CAD',['Visor, zoom y marcas documentales.','Partidas, APU y descarga DWG.'],1210,520,215,160,'purple')
p.node('M08B','Flujo LBMS',['Gráfico tiempo–ubicación.','Plan y pronóstico; puntos','observados cuando existen.'],1445,520,215,160,'purple')
p.node('M09','Datos de obra',['4 pestañas de importación y configuración.','Respaldo JSON y nuevo proyecto.'],1210,700,450,95,'green')
for id,title,lines,x,y in [('M09A','Cronograma',['Excel / CSV / Project XML.'],1210,815),('M09B','Metrados y R',['Cantidad, unidad y rendimiento.'],1445,815),('M09C','Ubicaciones LBS',['Ubicación, grupo y orden.'],1210,925),('M09D','Proyecto/calendario',['Jornadas y feriados.'],1445,925)]:p.node(id,title,lines,x,y,215,100,'green')
p.node('C00','Controles compartidos',['Fecha de corte: limita la observación.','Componente: se conserva entre vistas.','Plan semanal e indicadores evalúan','el corte completo, sin filtrar miembros.'],40,600,330,185,'amber')
p.node('C01','Cómo pedir un cambio',['Usa el código del bloque.','Ejemplo: «Mover M09C bajo M08».','Ese cambio aún NO está aplicado.'],40,820,330,165,'gray')
p.node('L00','LBS ≠ LBMS',['LBS organiza los lugares de trabajo. LBMS utiliza esas ubicaciones, cantidades y tiempos para representar el flujo. Los planos CAD son otra vista del expediente.'],40,1040,1620,95,'amber')
p.edge('M08','M08A');p.edge('M08','M08B');
p=Page('02 · Proceso de trabajo','Las flechas indican dependencias y decisiones. Una tarea importada no queda preparada automáticamente.')
positions=[(40,140),(455,140),(870,140),(1285,140),(1285,390),(870,390),(455,390),(40,390),(40,700),(455,700),(870,700)]
content=[('F01','Cargar las fuentes',['Cronograma XML / Excel / CSV.','Metrados y catálogo de rendimientos.']),('F02','Revisar la importación',['Elegir hoja y columnas; validar errores.','Conservar fechas y precedencias.']),('F03','Completar actividad–ubicación',['Vincular cantidad Q y rendimiento R.','Definir ubicación, orden y cuadrilla.']),('F04','Revisar el Lookahead',['¿Qué trabajo se aproxima?','¿Qué condiciones faltan?']),('F05','¿Está listo para ejecutar?',['Comprobar datos, calendario, secuencia,','entregas previas y restricciones.']),('F06','Gestionar restricciones',['Problema + responsable + fecha.','Evidencia y revisión para liberar.']),('F07','Confirmar preparación',['Revisión declarada por responsable.','Recursos, seguridad, calidad y frente.']),('F08','Acordar y congelar la semana',['Cantidad objetivo y criterio de término.','Guardar miembros y condiciones del corte.']),('F09','Registrar lo observado',['Cantidad diaria, fecha, evidencia, entrega.','Interrupciones: intervalo y causa.']),('F10','Evaluar compromisos',['Cumplido o no cumplido.','Si falla: causa y acción correctiva.']),('F11','Aprender y volver a planificar',['PPC / PRL / continuidad.','Revisar causas y próximas decisiones.'])]
for (id,title,lines),(x,y) in zip(content,positions):p.node(id,title,lines,x,y,365,130,'amber' if id in ('F05','F06') else 'green' if id in ('F07','F08') else 'blue')
for a,b in [('F01','F02'),('F02','F03'),('F03','F04'),('F04','F05'),('F07','F08'),('F08','F09'),('F09','F10'),('F10','F11')]:p.edge(a,b)
p.edge('F05','F06','Faltan condiciones')
p.edge('F06','F05','Volver a revisar',via=[(1052,555),(1467,555)])
p.edge('F05','F07','Condiciones completas',via=[(1260,455),(1260,315),(637,315)])
p.edge('F11','F04','Siguiente ciclo',via=[(1670,765),(1670,205)],dash=True)
p.node('V01','VISUALIZACIÓN DE APOYO · M08',['Planos CAD: consultar documentos y partidas.  |  Flujo LBMS: consultar tiempo y ubicación.', 'Las vistas ayudan a revisar; no crean avance ejecutado ni liberan restricciones por sí solas.'],40,910,1620,100,'purple')
p.node('R01','Reglas que condicionan el proceso',['• Una fecha estimada no libera una restricción: se exige evidencia, fecha real y revisión.', '• La duración Q/R requiere unidades compatibles y metrado de la ubicación; un total agregado no define frentes.', '• El compromiso exige preparación vigente. La semana se congela antes de iniciar; no se añaden miembros después.', '• Los registros respetan el corte y el calendario. La falta de registros no demuestra avance físico igual a cero.'],40,1030,1620,135,'amber')
p=Page('03 · Datos y cálculos','Arquitectura actual · Aplicación estática en navegador, con guardado local y respaldo exportable.')
p.node('T01','Entradas',['Cronograma XML / Excel / CSV.','Metrados Excel / CSV; catálogo APU CSV.','Expediente publicado: PDFs y vistas CAD.','MPP y DWG no se interpretan directamente en el navegador.'],40,140,460,165,'green')
p.node('T02','Interfaz y validación',['app.js + importers.js','Formularios, importación, fecha de corte.','workspace-ui.js: resumen y fichas.','Selecciona el proyecto real o la prueba.'],620,140,460,165,'blue')
p.node('T03','Modelo del proyecto',['Actividades y cantidades por ubicación.','Restricciones y vínculos a actividades.','Planes, avances e interrupciones.','Componentes, fuentes, planos y marcas.','Correspondencias e historial.'],620,390,460,205,'green')
p.node('T04','Motor operativo · engine.js',['Calendario y duración Q/R.','Precedencias, entregas y cuadrillas.','Preparación y pronóstico condicionado.','Compromisos, PPC, PRL y continuidad.'],40,390,460,205,'blue')
p.node('T05','Relación documental',['relations.js + documents.js','Cruces de WBS, descripción y componente.','Referencias a metrado, APU y plano.','No reparte totales ni inventa ubicaciones.','Un enlace documental no habilita ejecución.'],1200,140,460,190,'amber')
p.node('T06','Salidas y visores',['Resumen, Lookahead y restricciones.','Plan semanal y registro de avance.','Indicadores, historial y exportaciones.','plans-ui.js: visor CAD.','Flujo LBMS: gráfico de tiempo–ubicación.'],1200,390,460,205,'purple')
p.node('T07','Mis datos · almacenamiento local',['Proyecto guardado en este navegador.','Versión anterior para recuperación.','Exportar / restaurar respaldo JSON.','Sin sincronización entre dispositivos.'],40,740,460,175,'green')
p.node('T08','Prueba · almacenamiento separado',['Prueba vacía: inicia sin registros.','Predeterminados: 8 actividades, 4 restricciones','y un plan con 2 compromisos ficticios.','Ambas opciones usan un espacio de prueba.','Mis datos recupera el proyecto anterior.'],620,740,460,195,'amber')
p.node('T09','Alcance de la seguridad actual',['Se verifica la estructura de los registros.','La prueba no escribe sobre el proyecto real.','No hay cuentas, roles autenticados ni servidor','de evidencias; el revisor es declarado.','Borrar datos del navegador puede perder registros.'],1200,740,460,195,'gray')
p.node('T10','Qué significa «conectado»',['Conexión operativa: misma partida + ubicación → puede alimentar Q/R y preparación si cumple las demás reglas.', 'Conexión documental: correspondencia de fuentes → sirve para consultar y revisar, aunque la ejecución siga pendiente.', 'LBS y cuadrillas reales deben definirse y validarse; los documentos agregados no sustituyen esos datos.'],40,1000,1620,140,'amber')
p.edge('T01','T02');p.edge('T02','T03');p.edge('T02','T05');p.edge('T05','T06');p.edge('T03','T04','calcular');p.edge('T03','T06','mostrar');p.edge('T04','T06','resultados calculados',via=[(270,620),(1430,620)]);p.edge('T03','T07','guardar / recuperar',via=[(850,655),(270,655)]);p.edge('T03','T08','solo en modo prueba')
# XML for diagrams.net: every box and arrow is individually editable.
mx=X.Element('mxfile',host='app.diagrams.net',type='device')
for idx,p in enumerate(pages,1):
 d=X.SubElement(mx,'diagram',id=f'page-{idx}',name=p.title);m=X.SubElement(d,'mxGraphModel',dx='1700',dy='1220',grid='1',gridSize='10',page='1',pageWidth='1700',pageHeight='1220');r=X.SubElement(m,'root');X.SubElement(r,'mxCell',id='0');X.SubElement(r,'mxCell',id='1',parent='0')
 allnodes=[dict(id=f'title{idx}',title=p.title,lines=[p.subtitle],x=40,y=20,w=1620,h=65,color='white',kind='title')]+p.nodes
 for n in allnodes:
  bg,stroke=colors[n['color']];text=n['id']+' · '+n['title'] if n['kind'] not in ('title','group') else n['title']
  value=html.escape(text)+'&#xa;'+'&#xa;'.join(html.escape(x) for x in n['lines'])
  cell=X.SubElement(r,'mxCell',id=n['id'],value=text+'\n'+'\n'.join(n['lines']),style=f'rounded=1;whiteSpace=wrap;html=0;fillColor={bg};strokeColor={stroke};fontColor=#173c31;fontSize=16;align=left;verticalAlign=top;spacing=14;',vertex='1',parent='1');X.SubElement(cell,'mxGeometry',x=str(n['x']),y=str(n['y']),width=str(n['w']),height=str(n['h']),**{'as':'geometry'})
 for j,e in enumerate(p.edges):
  cell=X.SubElement(r,'mxCell',id=f'e{idx}-{j}',value=e['label'],style='edgeStyle=orthogonalEdgeStyle;rounded=0;html=0;endArrow=block;strokeColor=#638173;fontSize=14;labelBackgroundColor=#ffffff;'+('dashed=1;' if e['dash'] else ''),edge='1',parent='1',source=e['a'],target=e['b']);geom=X.SubElement(cell,'mxGeometry',relative='1',**{'as':'geometry'})
  if e['via']:
   points=X.SubElement(geom,'Array',**{'as':'points'})
   for x,y in e['via']:X.SubElement(points,'mxPoint',x=str(x),y=str(y))
X.ElementTree(mx).write(out/'Estructura-Pitocuna-editable.drawio',encoding='utf-8',xml_declaration=True)
# Portable SVG sheets, no external fonts or scripts.
for idx,p in enumerate(pages,1):
 parts=['<svg xmlns="http://www.w3.org/2000/svg" width="1700" height="1220" viewBox="0 0 1700 1220"><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10Z" fill="#638173"/></marker></defs><rect width="1700" height="1220" fill="#fbfcfa"/>']
 parts.append(f'<text x="40" y="44" font-family="Arial" font-size="29" font-weight="bold" fill="#173c31">{html.escape(p.title)}</text><text x="40" y="73" font-family="Arial" font-size="16" fill="#60766b">{html.escape(p.subtitle)}</text>')
 nodes={n['id']:n for n in p.nodes}
 for e in p.edges:
  a,b=nodes[e['a']],nodes[e['b']]
  if e['via']:
   # Named waypoints define the route; start/end anchors face the nearest waypoint.
   def anchor(n,q):
    cx=n['x']+n['w']/2;cy=n['y']+n['h']/2;dx=q[0]-cx;dy=q[1]-cy
    if abs(dx)/n['w']>abs(dy)/n['h']:return (n['x']+n['w'] if dx>=0 else n['x'],cy)
    return (cx,n['y']+n['h'] if dy>=0 else n['y'])
   pts=[anchor(a,e['via'][0])]+e['via']+[anchor(b,e['via'][-1])]
  elif abs((b['y']+b['h']/2)-(a['y']+a['h']/2))<50:
   right=b['x']>a['x'];pts=[(a['x']+a['w'] if right else a['x'],a['y']+a['h']/2),(b['x'] if right else b['x']+b['w'],b['y']+b['h']/2)]
  else:pts=[(a['x']+a['w']/2,a['y']+a['h']),(b['x']+b['w']/2,b['y'])]
  parts.append(f'<polyline points="'+ ' '.join(f'{x},{y}' for x,y in pts)+f'" fill="none" stroke="#638173" stroke-width="2" marker-end="url(#arrow)"'+(' stroke-dasharray="8 6"' if e['dash'] else '')+'/>')
  if e['label']:
   q=pts[len(pts)//2];px=q[0];py=q[1]-12
   if len(pts)==2:px=(pts[0][0]+pts[1][0])/2;py=(pts[0][1]+pts[1][1])/2-12
   if e['a']=='F05' and e['b']=='F06':px,py=1050,375
   if e['a']=='F05' and e['b']=='F07':px,py=830,302
   if e['a']=='F11' and e['b']=='F04':px,py=1440,748
   if e['a']=='T04' and e['b']=='T06':px,py=1170,640
   parts.append(f'<text x="{px}" y="{py}" text-anchor="middle" font-family="Arial" font-size="14" fill="#375a49" stroke="#fbfcfa" stroke-width="5" paint-order="stroke">{html.escape(e["label"])}</text>')
 for n in p.nodes:
  bg,stroke=colors[n['color']];x,y,w,h=n['x'],n['y'],n['w'],n['h'];parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="{bg}" stroke="{stroke}" stroke-width="1.6"/>')
  text=n['title'] if n['kind']=='group' else n['id']+' · '+n['title'];wrapped=textwrap.wrap(text,width=max(18,int((w-32)/8.1)),break_long_words=False)
  ty=y+29
  for line in wrapped:parts.append(f'<text x="{x+16}" y="{ty}" font-family="Arial" font-size="16" font-weight="bold" fill="#173c31">{html.escape(line)}</text>');ty+=22
  ty+=7
  for line in n['lines']:
   for t in textwrap.wrap(line,width=max(18,int((w-32)/7.1)),break_long_words=False):parts.append(f'<text x="{x+16}" y="{ty}" font-family="Arial" font-size="14" fill="#486455">{html.escape(t)}</text>');ty+=20
  if ty>y+h+12:print('REVISAR ALTURA',n['id'],ty,y+h)
 parts.append('<text x="40" y="1200" font-family="Arial" font-size="13" fill="#60766b">Pitocuna · Estructura actual d4074f4 · Los códigos permiten solicitar cambios; no representan pantallas nuevas.</text></svg>')
 (out/f'{idx:02d}-'+Path('dummy') if False else out/f'{idx:02d}-diagrama.svg').write_text(''.join(parts))
# Printable and screen view, completely offline.
htmltext='<!doctype html><html lang="es"><meta charset="utf-8"><title>Estructura actual de Pitocuna</title><style>@page{size:A3 landscape;margin:8mm}*{box-sizing:border-box}body{margin:0;font-family:Arial;background:#edf2ec}.sheet{page-break-after:always;background:white;margin:15px auto;max-width:1700px}.sheet:last-child{page-break-after:auto}svg{width:100%;height:auto;display:block}@media print{body{background:white}.sheet{margin:0;width:100%;max-width:none;height:280mm;break-inside:avoid}svg{width:100%;height:100%;object-fit:contain}}</style>'
for idx in range(1,4):htmltext+='<section class="sheet">'+(out/f'{idx:02d}-diagrama.svg').read_text()+'</section>'
(out/'Ver-diagramas.html').write_text(htmltext)
(out/'bloques.json').write_text(json.dumps([dict(title=p.title,nodes=p.nodes,edges=p.edges) for p in pages],ensure_ascii=False,indent=2))
print('Generados 3 diagramas SVG y 3 hojas editables draw.io')
