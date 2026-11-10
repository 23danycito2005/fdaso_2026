# Estructura actual de Pitocuna — para revisar y proponer cambios

Representa el código actual d4074f4, revisado el 10/11/2026. No modifica la aplicación. Los códigos M son pantallas; F son pasos; T son partes del sistema. Los colores agrupan funciones, no indican que los datos estén validados.

## Archivos

- **Estructura-Pitocuna.pdf**: tres hojas A3 horizontales, para leer, imprimir o anotar.
- **Estructura-Pitocuna-editable.drawio**: tres páginas con bloques y conectores editables. Abre diagrams.net / draw.io y elige Archivo → Abrir desde → Dispositivo. Edita el texto con doble clic; arrastra los bloques y las flechas. Guarda el archivo y envíamelo.
- **Ver-diagramas.html**: las mismas tres hojas para abrir en cualquier navegador, sin conexión ni instalaciones.
- **01/02/03-diagrama.svg y .png**: imágenes de cada hoja. SVG conserva nitidez al ampliar; PNG se puede insertar en Word o PowerPoint.
- **bloques.json**: inventario estructurado de bloques y conexiones, para reutilizarlo.

## Qué muestra cada hoja

1. **Mapa de pantallas**: dónde está cada módulo y qué contiene. M08 agrupa los visores; M09 agrupa las fuentes y configuración. Los encabezados G solo identifican grupos del menú actual.
2. **Proceso de trabajo**: cómo pasa una actividad desde las fuentes hasta la evaluación. Las restricciones pueden devolverla a revisión. Estar cargada o vinculada a un documento no equivale a estar preparada.
3. **Datos y cálculos**: qué entra, qué se guarda, qué se calcula y qué sale. Distingue las fuentes documentales de las cantidades por ubicación que requiere la operación.

## Detalle de pantallas y entradas

| Código | Pantalla / bloque | Qué registra o consulta | Qué conecta o produce |
|---|---|---|---|
| S00 | Selector superior | Mis datos; prueba vacía; valores predeterminados | Cambia el espacio de trabajo, marca el activo y muestra cantidades. Las dos pruebas utilizan el mismo almacenamiento de práctica; cambiar de una a otra carga el escenario elegido. |
| M01 | Resumen | Estado de datos, restricciones, actividades preparadas y pendientes | Accesos a las tareas que necesitan revisión. El resumen cambia según el proyecto tenga expediente o sea una prueba. |
| M02 | Actividades | Búsqueda por nombre/ID/código, filtro por componente y correspondencia | Ficha central con fechas, metrado, APU, planos, restricciones, preparación, compromisos y ejecución. |
| M02 — edición rápida | Actividad | Nombre, ubicación y cuadrilla si se conocen, inicio y fin. El alta añade componente | ID automático; puede guardarse incompleta para continuar después. El código omitido queda provisional. Guardar no confirma preparación. |
| M02 — opciones técnicas | Planificación técnica | Código, grupo LBMS, orden espacial, precedencias, incompatibilidades, fuente e hito | Conserva los enlaces importados. Una relación de Project distinta de fin–inicio sin desfase requiere revisión explícita. |
| M03 | Lookahead | Horizonte de 3, 4, 6 u 8 semanas; filtro por preparación | Presenta actividades próximas y arrastre. Sin cálculo operativo, las barras usan referencia del cronograma y lo indican. Permite revisar restricciones y confirmar preparación cuando corresponda. |
| M04 | Restricciones | Problema, responsable, actividad afectada y fecha necesaria; se sugiere el inicio del cronograma, editable | Condición asociada a una o varias actividades. Categoría, fecha estimada y otros vínculos están en Más opciones. La fecha necesaria puede quedar pendiente y se reporta como incompleta. |
| M04 — liberación | Cierre de restricción | Fecha real, evidencia, revisor y confirmación | Abierta / en revisión / liberada. Una estimación por sí sola no libera. Cambiar una restricción ya liberada exige reabrirla. |
| M05 | Plan semanal | Semana de hasta 7 días; actividad preparada, cantidad comprometida y criterio de término | Borrador → congelado → evaluado. Congelar conserva miembros, calendario, ventanas y fechas necesarias; luego no se agregan ni retiran miembros. |
| M06 | Registro de avance | Actividad, fecha, cantidad incremental, evidencia y revisor; entrega completa opcional | Producción observada y cantidades acumuladas. Interrupción: actividad, inicio, fin y causa. Los hitos se confirman sin cantidad. |
| M07 | Indicadores | Corte y plan semanal seleccionado | PPC = compromisos cumplidos / congelados. PRL = restricciones liberadas a tiempo / vencidas en el periodo, sin duplicar las compartidas. Continuidad = tiempo programado observado menos interrupciones consolidadas, sobre tiempo programado observado. Sin denominador: no aplica. |
| M08 | Visualización de obra | Componente compartido; dos pestañas | Reúne M08A y M08B. Tiene accesos a actividades y registro de avance. |
| M08A | Planos CAD | Especialidad, vista SVG derivada del DWG, zoom, desplazamiento y marcas manuales | Referencias a partidas, Excel y APU. Descarga del DWG original. La marca documental no mide cantidad ni registra ejecución; no es un modelo BIM 4D. |
| M08B | Flujo LBMS | Grupo de ubicaciones comparables, cantidades, rendimientos, secuencia y registros | Eje tiempo–ubicación. Plan operativo, pronóstico y puntos observados. Si faltan ubicaciones o datos de cálculo, indica lo pendiente en lugar de inventar líneas. |
| M09A | Cronograma | XML de MS Project, Excel o CSV; hoja, encabezado y columnas | Actividades con fechas y precedencias; el WBS requiere correspondencia con partidas. El archivo MPP debe convertirse/exportarse a XML antes de usar el importador del navegador. |
| M09B | Metrados y rendimientos | Código, ubicación, cantidad Q, unidad, rendimiento R y fuente; importación Excel/CSV y catálogo APU CSV | Metrado por ubicación y duración Q/R con unidades compatibles. Los APU son referencias a validar, no productividad observada. Los PDF cargados se consultan como fuente; no son importación automática de rendimiento desde el formulario. |
| M09C | Ubicaciones LBS | Consulta la estructura derivada de las actividades | Tramos, componentes o unidades UBS. La ubicación se asigna en la actividad; el grupo y orden están en sus opciones técnicas. No es un segundo registro independiente de frentes. |
| M09D | Proyecto y calendario | Nombre, responsable, origen, capacidades diarias, feriados y confirmación | Calendario de cálculo. Gestión del proyecto y respaldos se acceden también desde Datos de obra. |
| C00 | Controles compartidos | Fecha de corte y filtro de componente | El corte es el cierre del día observado. Plan semanal e indicadores consideran el corte completo para conservar denominadores. |

## Relaciones importantes para decidir modificaciones

- **Actividad → restricción:** una restricción puede afectar varias actividades; cada vínculo conserva su fecha necesaria.
- **Actividad → metrado operativo:** unión por código de partida + ubicación. No basta que se parezcan los nombres.
- **Actividad → fuente documental:** cruce conservador de WBS, descripción y componente, o revisión manual con responsable y criterio. No distribuye el total entre viviendas/tramos ni convierte ese total en frente real.
- **Actividad → plano:** asociación por componente/especialidad; las marcas se ubican manualmente y son referencias documentales.
- **Actividad → compromiso:** puede aparecer en distintos cortes; cada compromiso tiene una cantidad y criterio propios. Solo el trabajo preparado puede añadirse.
- **Plan congelado → indicadores:** se guardan las condiciones del corte; las ediciones posteriores no reemplazan sus denominadores.
- **Registro observado → avance/LBMS:** las cantidades y fechas alimentan la consulta; no se presume producción entre observaciones.
- **Mis datos / prueba:** los cambios ficticios se guardan separados del proyecto real en el navegador. Mis datos recupera lo guardado antes de entrar. No hay sincronización entre equipos ni usuarios autenticados.

## Lo que ya existe y lo que falta en el expediente

El expediente publicado conserva 718 tareas (716 de producción y 2 hitos), 705 metrados y 15 planos CAD. El cruce conservador inicial detecta 443 correspondencias documentales; las demás se revisan. Los datos son agregados por componente o tipo de UBS. Todavía deben definirse ubicaciones de ejecución identificadas, sus cantidades, cuadrillas y secuencia; también validarse calendario y rendimientos. La prueba ficticia sí trae ubicaciones y registros para demostrar el flujo, pero no acredita ejecución real.

## Cómo indicarme tus cambios

Puedes escribir una lista, anotar el PDF o editar el draw.io. Usa los códigos para que el cambio sea inequívoco.

Ejemplos de instrucciones (NO aplicadas):
- «Mover M09C debajo de M08, junto a los visores».
- «En M04 dejar visibles estos campos y mover estos otros a Opciones».
- «En F05, si falta material, llevar primero a F06».
- «M08A debe abrirse desde la ficha M02 mostrando la partida elegida».

Plantilla para cada cambio:

| Bloque o conexión | Cambio que quiero | Dónde debe quedar / cuándo ocurre | Qué datos conserva o pide |
|---|---|---|---|
| Ej.: M09C | Mover | Dentro de M08 | Conservar ubicación, grupo y orden |

Primero edita o marca lo que quieras; luego envíame el archivo o los códigos y tus instrucciones. El diagrama describe la versión existente. Cambiar este documento no cambia por sí solo el programa.
