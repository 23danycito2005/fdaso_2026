# Propuesta inicial de aplicación para la tesis

> **Propuesta preliminar, sujeta a modificaciones y validación.** El diseño, las funciones y los criterios de cálculo podrán ajustarse durante el desarrollo de la tesis.

Fuente: **BORRADOR TESIS (2).pdf**, aportado por el usuario. Este documento propone un diseño; los ejemplos de la maqueta son ficticios. No acredita resultados de obra ni una aplicación implementada.

## Revisión a partir de la referencia ConferSafe

El usuario aportó `confi-confersafe.zip` como referencia visual y pidió un inicio simple que explique el proceso, conservando las propuestas anteriores e incorporando el avance de obra mediante un dibujo y la parte LBMS.

- **`index.html`:** nueva portada de presentación, con una explicación en tres pasos —planificar, preparar y dar seguimiento—, una muestra del avance y acceso directo a la demo. Nombre de trabajo: Pitocuna. La referencia orienta la estructura; no se trasladan sus cifras comerciales, testimonios, formularios, servicios externos ni funcionalidades de IA.
- **`propuestas.html`:** conserva panel operativo, tablero y vista de campo. Añade una cuarta vista **Avance de obra**, accesible también mediante `propuestas.html#lbms`.
- **`avance-obra.html`:** módulo visual compartido entre portada y demo. Alterna **esquema de obra** y **gráfico tiempo–ubicación**; permite mover el corte entre J3 y J15 y consultar los tres tramos.
- **Esquema:** conexión referencial entre captación, tres tramos de agua y reservorio. La selección de un tramo muestra estado y explicación. Se reserva una zona independiente para las UBS, cuya geometría y avance deberán definirse con los datos autorizados.
- **LBMS:** tramos en el eje vertical y jornadas en el horizontal; líneas de flujo para excavación y tubería. Distingue plan, registro y pronóstico ilustrativo. La espera entre J6 y J10 aparece sin transferencia a otra ubicación.
- **Escenario:** excavación en J1–J7; tubería registrada en T-01 J3–J6, espera J6–J10, T-02 J10–J12 y T-03 J12–J15. Antes del corte se muestra el registro del escenario; después, el pronóstico ilustrativo. La restricción DEMO-R1 tiene fecha necesaria J6 y liberación prevista/registrada J10. Es un escenario separado de las cuatro fichas de la primera propuesta.

La portada presenta el producto y el proceso; la demo sirve para revisar las pantallas. La maquetación es local y no envía información. Persistencia, edición, usuarios, evidencia real, cálculos con datos de obra y sincronización siguen pendientes de implementación. El esquema no equivale a un plano ni a un modelo BIM; los estados ilustrativos no calculan un porcentaje global de avance ni acreditan conformidad técnica.

## Aplicación integrada para acceso web

La petición posterior del usuario prioriza abrir una aplicación unificada desde un enlace. `index.html` pasa a ser el punto de entrada de la demo con cuatro secciones. El esquema LBMS se integra en el mismo documento mediante un componente web, sin iframes. Las rutas antiguas redirigen al punto de entrada. La portada explicativa se conserva en `presentacion.html`.

El tramo T-02 se relaciona ahora con la ficha R-001 del panel: fecha necesaria J6, estimación J10 y holgura −4 jornadas. La simulación permite recorrer distintos cortes; el panel conserva el corte de prueba J7. La evolución simulada no modifica los registros de prueba ni constituye captura de datos reales.

La rama contiene `.nojekyll` y está preparada para servir la raíz con GitHub Pages. La activación y la publicación no están confirmadas: la red del entorno impide consultar la API de GitHub Pages y el dominio del sitio. El README documenta cómo activar la publicación por rama.

## Propósito

Apoyar al residente o responsable de planificación para preparar actividades, gestionar la liberación de restricciones y observar la continuidad de los frentes en Nueva Esperanza, Bajo Pitocuna. La unidad de control será **actividad–ubicación–tiempo**, integrando Last Planner System (LPS) y Location-Based Management System (LBMS).

## Tres propuestas visuales

| Propuesta | Uso principal | Ventaja | Consideración |
| --- | --- | --- | --- |
| 1. Panel operativo | Revisar restricciones, fechas, responsables y alertas | Permite comparar y priorizar durante la planificación | En celular necesita una presentación con tarjetas |
| 2. Tablero por estados | Coordinar responsables y siguientes acciones en reuniones | Hace visible el recorrido hasta la liberación | Complementarlo con tabla y calendario para analizar fechas |
| 3. Vista de campo | Consultar y capturar por ubicación desde un celular | Reduce la carga visual y facilita el registro | El registro y la consulta sin internet requieren almacenamiento y cálculo locales |

Recomendación preliminar: **panel operativo como inicio**, con tablero y vista de campo como presentaciones complementarias del mismo registro. Fondo claro, verde oscuro como color principal, tipografía legible y alertas con color, texto y causa.

La maqueta `propuestas.html` permite alternar las tres vistas, buscar fichas, filtrar ubicaciones y abrir detalles de ejemplo. Funciona como archivo local sin descargar recursos externos. No implementa usuarios, edición, persistencia, adjuntos, cálculos de producción ni sincronización.

## Pantallas del prototipo funcional

1. **Inicio:** restricciones pendientes, liberación estimada tardía, información incompleta y acceso a las acciones prioritarias. Mostrar fecha del corte y cobertura de datos.
2. **Ubicaciones y actividades:** tramos de redes de agua, componentes singulares —por ejemplo, reservorio— y UBS; códigos, cantidades, unidades, rendimientos, cuadrillas, calendario y precedencias.
3. **Lookahead y restricciones:** actividad–ubicación, categoría, descripción, responsable, fecha necesaria, estimación de solución, estado, acción y evidencia. Categorías iniciales propuestas: acceso, logística, coordinación, recursos, seguridad, calidad y ambiente.
4. **Ficha de restricción:** vínculos a actividades y ubicaciones afectadas; historial de estimaciones y acciones; fecha real de liberación; evidencia y revisión autorizada. Una restricción puede afectar varias combinaciones actividad–ubicación, con distintas fechas necesarias.
5. **Plan semanal:** incorporar únicamente actividades preparadas y confirmadas; congelar compromisos por corte; registrar cumplimiento, causa de no cumplimiento y acción correctiva.
6. **Flujo tiempo–ubicación:** representación LBMS con ubicación en el eje vertical y tiempo en el horizontal, distinguiendo plan operativo, ejecución y pronóstico. Diferenciar línea base contractual aprobada cuando exista. Señalar precedencias, interrupciones y solapes incompatibles.
7. **Indicadores y reportes:** PPC, PRL y continuidad; mostrar numerador, denominador, periodo, fuente y acceso a registros de respaldo. Exportación de reportes como función propuesta para la evaluación académica.
8. **Historial y sincronización:** autor, instante, versión y motivo de modificación; cambios pendientes, conflictos y resultado de sincronización. Distinguir datos reales, históricos y de prueba.

## Reglas que deben verse en el diseño

- Recorrido propuesto: identificada → en gestión → por verificar → liberada. La secuencia y los permisos se validarán con los usuarios. La liberación exige evidencia y revisión autorizada; una fecha estimada no confirma el cierre.
- **H = fecha necesaria − fecha estimada** en una escala común del calendario aplicable. H < 0: liberación estimada tardía; H = 0: sin margen; H > 0: margen previsto. Un valor positivo no equivale a actividad preparada.
- Si falta una estimación indispensable, mostrar **«no calculable»** y explicar qué dato completar. No reemplazar ausencias por cero.
- **PPC = compromisos cumplidos / compromisos congelados × 100.** Mantener el denominador del corte y el criterio documentado de cumplimiento.
- **PRL = restricciones liberadas con evidencia hasta su fecha necesaria / restricciones cuya fecha necesaria cae en el periodo × 100.** Incluir las pendientes del periodo en el denominador; no contar una misma restricción varias veces por afectar distintas actividades. Conservar las fechas necesarias del corte. Definir el tratamiento de esas relaciones múltiples antes de implementar el cálculo. Mostrar vencidas de periodos anteriores como pendientes acumuladas y las que carecen de fecha por separado.
- Un denominador nulo se presenta como **«no aplica»**.
- La continuidad se calcula sobre el tiempo programado; las interrupciones coincidentes no se suman dos veces.
- Un solape solo genera alarma de interferencia si las actividades son incompatibles en la ubicación.
- Una condición crítica abierta impide comprometer la actividad. La revisión de preparación incluye las demás condiciones y la confirmación del responsable.
- Registrar, calcular y consultar localmente durante una interrupción de internet; conservar cambios al cerrar y reabrir; sincronizar sin perder registros, duplicarlos ni borrar el historial.

## Recomendación técnica preliminar

**Django + PostgreSQL** sigue siendo una buena base para usuarios, permisos, datos centrales e historial. El requisito de trabajo sin internet exige además una interfaz web instalable (PWA), almacenamiento local —por ejemplo, IndexedDB—, cálculo local verificable y un protocolo de sincronización con revisión de conflictos.

Para esa interfaz, **React + TypeScript** es una alternativa razonable, con una biblioteca de gráficos capaz de representar tiempo–ubicación. Su selección es preliminar: la tesis plantea comparar soportes mediante una matriz de decisión. Django y Bootstrap por sí solos no resuelven el requisito de operación local durante una desconexión.

Alternativas de soporte para estudiar en la tesis, separadas de las tres propuestas visuales: aplicación web con operación local y sincronización; hoja de cálculo con formatos controlados; aplicación de escritorio con almacenamiento local e intercambio de datos. Evaluarlas por conectividad, trazabilidad, exactitud, uso en campo, mantenimiento y costo. No se han asignado puntuaciones ni confirmado la viabilidad de cada alternativa.

## Orden sugerido de construcción

1. Validar el recorrido y las pantallas con los usuarios previstos; completar requisitos y criterios de aceptación.
2. Construir ubicaciones, actividades y restricciones con responsables, evidencia e historial; validar captura y cálculo locales en un recorrido pequeño desde el principio.
3. Añadir confirmación de preparación, compromisos semanales y congelamiento por corte.
4. Implementar ecuaciones y comprobar resultados frente a una hoja independiente, incluyendo datos ausentes y denominadores nulos.
5. Incorporar el gráfico tiempo–ubicación, alertas e indicadores con acceso al origen de cada resultado.
6. Completar y probar sincronización, conflictos, permisos y recuperación; después realizar la evaluación con expertos y datos autorizados.

## Referencias al borrador

- §1.6, página PDF 7: alcance del prototipo y comparación de soportes.
- §§3.2–3.3, páginas PDF 17–24: procedimientos, cálculos, indicadores y trazabilidad.
- §3.3.1, página PDF 22: estructura actividad–ubicación–tiempo.
- §§3.3.3–3.3.6, páginas PDF 23–24: alertas, captura local, representación y verificación.
- §4.3 y tabla III, páginas PDF 29–31: conectividad, información, operación, evidencia y criterios de aceptación.
- §§5.2–5.4, página PDF 36: aparecen como encabezados pendientes de desarrollar en el borrador recibido. Esta propuesta puede servir de insumo para esos apartados.

Decisiones pendientes para la implementación: roles y permisos reales; calendario y jerarquía de ubicaciones; criterio de cierre; tratamiento de restricciones compartidas en PRL; equipos y conectividad; disponibilidad y autorización de registros. No impiden revisar estas propuestas visuales.
