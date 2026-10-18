# Relación entre la tesis y el prototipo de producción

> **Propuesta preliminar, sujeta a modificaciones y validación.** Los datos de demostración son ficticios y no acreditan desempeño de Bajo Pitocuna.

La unidad de control es **actividad–ubicación–tiempo**. El cronograma aporta referencia, precedencias e hitos; los metrados por ubicación y rendimientos aportan cantidades y capacidad; LPS prepara y compromete; LBMS representa el flujo y actualiza el pronóstico a partir del registro.

## Entradas y conservación de su significado

| Entrada | Campos | Tratamiento |
| --- | --- | --- |
| Cronograma | ID estable, partida, actividad, fechas, predecesoras, cuadrilla | Importación XML/Excel/CSV o registro manual. Las fechas de referencia se conservan. No se declara una línea base contractual aprobada sin autorización. |
| LBS | Ubicación, componente, grupo comparable, orden | Diferencia tramos de agua, reservorio y UBS. Las inconsistencias en la misma ubicación bloquean la preparación. |
| Metrados y rendimientos | Partida + ubicación, Q, unidad, R/jornada, fuente | Unión explícita por código y ubicación; no se infiere desde el nombre. Datos ausentes o incompatibles no se sustituyen por cero. |
| Calendario | Origen, capacidad de cada día, días no laborables | Capacidades entre 0 y 1 jornada por día, con jornadas parciales. El XML no cambia automáticamente este calendario. |
| Restricciones | ID, condición, responsable, vínculos, fecha necesaria por vínculo, estimación | Una condición puede bloquear varios frentes. El cierre exige fecha real, evidencia referenciada y revisor. |
| Producción | Actividad–ubicación, cantidad diaria incremental, fecha, evidencia, responsable | El acumulado no supera Q. La entrega técnica se confirma adicionalmente. Se admite confirmación documentada de hitos. |

## Cadena de cálculo y decisión

1. **Referencia → plan operativo:** d = Q/R y F = S+d en escala laboral. Los inicios consideran precedencias fin–inicio y disponibilidad secuencial de la misma cuadrilla. No se calcula una reprogramación contractual.
2. **Preparación Lookahead:** horizonte configurable de 3 a 8 semanas, con arrastre de trabajo pendiente. Se muestran cantidad, rendimiento, duración, preparación y exposición. Una actividad puede estar prevista y seguir bloqueada.
3. **Alerta trazable:** H = Dnecesaria − Destimada; H < 0 indica liberación prevista tardía. E = max(0, max Destimada de restricciones pendientes − S). Sin estimación indispensable, E es «no calculable». El calendario es común.
4. **Preparación confirmada:** datos calculables, ubicación coherente, ausencia de restricciones pendientes, entregas precedentes e incompatibilidades revisadas; confirmación declarada de recursos, seguridad, calidad y disponibilidad. Cambiar condiciones invalida la confirmación.
5. **Compromiso:** actividad preparada, cantidad dentro del alcance pendiente, criterio verificable y ventana semanal compatible. Se congela antes del periodo y sus resultados.
6. **Registro y cierre:** cantidades incrementales observadas y revisión del criterio. El compromiso solo puede cerrarse como cumplido si se alcanzó el objetivo dentro de la semana y se confirmó su criterio; el incumplimiento necesita causa y acción.
7. **Flujo:** se representa por grupos comparables y orden de ubicación, diferenciando plan operativo, pronóstico y puntos de ejecución observada. La variación de Q, R o estimaciones recalcula el modelo; el registro no se inventa a partir del dibujo.

## Indicadores y sus límites

- **PPC:** compromisos íntegramente cumplidos / miembros congelados. Los pendientes de evaluar se distinguen; el resultado se identifica como provisional mientras existan.
- **PRL:** liberadas con evidencia y revisión hasta su fecha necesaria / restricciones cuya fecha necesaria congelada cae en el periodo. Cada ID cuenta una vez; en condiciones compartidas se toma la fecha más temprana de los vínculos del corte, conforme a §3.2.2 del borrador. Las fechas ausentes y los pendientes anteriores se presentan aparte.
- **Continuidad:** tiempo programado observado menos la unión de interrupciones, dividido entre ese tiempo programado. Se usa el calendario del corte y se recortan interrupciones a las ventanas congeladas y observadas. El resumen es ponderado por jornadas actividad–ubicación; no es un porcentaje de avance físico.
- **Rendimiento observado:** solo con cobertura diaria completa desde el primer registro, descontando interrupciones; de otro modo permanece no calculable y el pronóstico usa R planificado.
- **Solape incompatible:** O = max(0, min(Fi,Fj) − max(Si,Sj)); genera advertencia solo cuando se declara incompatibilidad en la misma ubicación.
- **Sin denominador:** «no aplica». Sin dato indispensable: «no calculable». El avance de distintos tipos/unidades no se agrega en un porcentaje global.

## Prueba demostrable

El escenario inicial contiene 8 actividades y metrados ficticios; EX-01 ya tiene entrega de prueba. En Lookahead, revisar TU-01 y confirmar preparación; crear semana 11–16/05/2026; comprometer 100 m con criterio; congelar; avanzar el corte al 16/05; registrar 100 m el 14/05 y confirmar entrega; cerrar el compromiso como cumplido. PPC = 1/1 = 100 %. Con una interrupción de TU-01 el 12 y 13/05, su ventana programada observada tiene 4 jornadas y 2 de interrupción: C = 50 %.

Se contrastan casos conocidos en `tests/production.test.mjs` y un recorrido de interfaz en `tests/browser_smoke.py`, con archivos Excel/CSV/XML auténticos de prueba. La tesis todavía requiere el contraste independiente con una hoja de cálculo, revisión por expertos y datos autorizados del proyecto.

## Alcance implementado y pendiente

Implementado: entradas editables, vista previa de importación, Q/R con calendario, precedencias y cuadrilla, Lookahead, gestión y revisión de restricciones compartidas, confirmación de preparación, compromisos congelados, avance/entrega/hitos, interrupciones consolidadas, representación LBMS, PPC/PRL/continuidad, historial local, respaldo y reapertura sin conexión.

Pendiente: comparación formal de soportes y matriz de decisión de la tesis, planificación pull de fases, autorización real de datos y roles, servidor y cuentas, adjuntos alojados, sincronización y resolución de conflictos, calendarios/relaciones complejas de MS Project, cartografía o BIM y evaluación con expertos. Las confirmaciones del prototipo local no autentican atribuciones profesionales. No se atribuye una reducción causal del plazo contractual.

Referencias al documento aportado: §§1.6 y 3.1–3.3, ecuaciones (3.1)–(3.8), §4.3 y tabla III. Los apartados de especificaciones y matriz del borrador estaban pendientes; esta implementación es un insumo sujeto a revisión para desarrollarlos.

## Publicación estática

Pages utiliza la rama `maqueta-pitocuna` y la carpeta `/docs`. `npm run build` genera allí los archivos de ejecución con rutas relativas y `.nojekyll`; la prueba de despliegue comprueba que coincidan con las fuentes de la raíz. Esto corrige la ausencia de la carpeta que impedía los primeros despliegues. La aplicación conserva su arquitectura local y no requiere un servidor de aplicación para alojarse en Pages.
