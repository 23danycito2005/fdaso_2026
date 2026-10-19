# Pitocuna · Producción LPS + LBMS

> **Propuesta preliminar, sujeta a modificaciones y validación.** Prototipo de investigación; no acredita resultados de obra ni sustituye autorizaciones técnicas.

Aplicación web para relacionar cronograma, ubicaciones, metrados y rendimientos con Lookahead, liberación de restricciones, compromisos semanales y avance LBMS. Se preparó a partir del borrador de tesis de Bajo Pitocuna aportado por el usuario. El usuario autorizó publicar los datos y planos aportados. El expediente público conserva sus fuentes y distingue lo pendiente de validar.

## Abrir y publicar

La entrada es `index.html`. GitHub Pages está configurado para publicar la rama `maqueta-pitocuna` desde **/docs**. `npm run build` copia el sitio completo a esa carpeta e incluye `.nojekyll`. La vista `?expediente=20261018#planos` carga el expediente y abre los planos. En una primera visita se cargan los datos publicados; un proyecto propio existente se conserva salvo que se use ese enlace de carga o el botón correspondiente. El estado anterior queda en el archivo local recuperable. `?demo=1` permite iniciar las pruebas ficticias en un navegador sin proyecto propio. Las fuentes se editan en la raíz; no edites las copias de `docs/` manualmente. Cuando Pages esté activado, el sitio esperado es https://23danycito2005.github.io/fdaso_2026/ . La comprobación externa depende del acceso de red del entorno; un push no demuestra por sí solo que el despliegue esté disponible.

Para desarrollar o probar localmente, usa un servidor HTTP; los módulos JavaScript no se ejecutan abriendo el archivo con `file://`:

```sh
npm ci --ignore-scripts
npm run dev
```

El servidor usa el puerto 8766. Node 24 se utilizó para la validación; Python 3 sirve los archivos locales. No hay base de datos remota ni secretos requeridos.

## Recorrido funcional

La vista **Actividades** es el punto de consulta del expediente. Permite buscar, paginar y filtrar por componente; el componente se conserva al pasar a Lookahead, restricciones, metrados, avance y planos. Los indicadores y el plan semanal siempre muestran el corte completo para no alterar sus denominadores. Desde cada tarea se abre una ficha con cronograma, cantidad, APU, plano, condiciones de preparación, restricciones y compromisos. En **Datos de obra** quedan la importación, la configuración y los respaldos.

El cruce documental del expediente inicial encuentra **443 correspondencias entre 716 tareas de producción** (más 2 hitos); **434** tienen Q/R de referencia compatible. Usa componente, descripción exacta salvo mayúsculas/acentos/espacios y código presupuestal derivado del WBS. La transformación del primer nivel WBS, desplazado por el hito inicial, se aplica exclusivamente al expediente identificado `pitocuna-public-2026-10-18`. Conserva dimensiones, fracciones y signos: una descripción diferente queda pendiente. No reutiliza un mismo metrado en varias tareas. Las 273 tareas restantes se revisan en **Por conciliar**.

**Revisar correspondencia** permite documentar una decisión con responsable y criterio, dentro del mismo componente. Se conserva en el respaldo y se invalida si cambian los datos de identificación o la cantidad/unidad. El enlace documental no asigna una ubicación, distribuye cantidades ni habilita compromisos: el motor operativo mantiene la unión partida–ubicación y sus controles de preparación. **Exportar trazabilidad** descarga la matriz del componente con fuentes, hoja/fila, APU, planos, restricciones y revisión para sustentar la tesis.

1. **Datos de obra:** importar cronograma `.xlsx`, `.csv` o MS Project `.xml`; `.mpp` debe exportarse a XML. Revisar hoja, fila de encabezado y asignación de columnas antes de confirmar. El WBS se conserva como referencia y requiere homologación con los códigos del expediente. Los vínculos SS o con desfase conservan sus datos originales y no generan un plan operativo fin–inicio hasta su revisión. Las tareas resumen XML se excluyen; los hitos se conservan. Los vínculos distintos de fin–inicio sin desfase se señalan para revisión, y el calendario XML requiere confirmación manual.
2. **Ubicaciones y metrados:** relacionar por **código de partida + ubicación**. Diferenciar redes, reservorio y UBS; asignar grupo de flujo comparable, orden y cuadrilla. Registrar cantidad, unidad, rendimiento por jornada y su fuente. Q/R produce la duración; las unidades incompatibles o datos faltantes generan «no calculable».
3. **Lookahead:** ventana de 3, 4, 6 u 8 semanas con duraciones calculadas y trabajo atrasado como arrastre. Se conservan las fechas de referencia; el plan operativo considera Q/R, precedencias y secuencia de la misma cuadrilla.
4. **Preparación y restricciones:** vincular condiciones a una o varias actividades, responsable, fechas necesaria/estimada, evidencia y revisión. Una estimación no libera nada. La revisión de recursos, seguridad, calidad y frente debe confirmarse antes del compromiso; cambios relevantes la invalidan.
5. **Plan semanal:** definir cantidad comprometida y criterio de término; incorporar únicamente actividades preparadas y coincidentes con la ventana semanal. Congelar antes del inicio y de los registros de resultados. El congelamiento conserva miembros, ventanas, calendario y fechas necesarias; no permite añadir o retirar miembros posteriormente.
6. **Avance:** registrar cantidades diarias incrementales, evidencia y responsable dentro del corte observado. La entrega completa requiere confirmación adicional y el metrado íntegro. Los hitos tienen confirmación documentada sin cantidad. Las interrupciones se registran como intervalos de días completos; los coincidentes se consolidan.
7. **Indicadores:** PPC desde el cierre del alcance/criterio; PRL con fecha necesaria más temprana de vínculos congelados, sin duplicar restricciones compartidas; continuidad ponderada por jornadas actividad–ubicación, dentro del tiempo programado observado. Un denominador nulo se muestra como «no aplica». El reporte CSV y el historial permiten revisar el origen.

### Metrados de expediente y APU

El importador detecta encabezados `PARTIDA / DESCRIPCIÓN / UNI, UNID. o UND / TOTAL` hasta la fila 100, tanto en tablas que comienzan en A como en B. Importa una hoja principal por vez: usa **TOTAL** sin multiplicarlo nuevamente por VECES ni sumar los detalles. Las hojas auxiliares de acero se revisan aparte y no se importan como otro metrado de producción. Un TOTAL vacío, sin resultado de fórmula o con error, y los códigos repetidos, bloquean la confirmación. La procedencia conserva archivo, hoja, fila y código original.

El alcance agregado de una hoja puede registrarse por componente o tipo de UBS cuando no se dispone de frentes. Eso no define ubicaciones individuales ni una secuencia espacial LBMS. La distribución por frentes debe prepararse y validarse antes de planificar su flujo.

Para convertir PDF de APU S10 con texto seleccionable a un catálogo revisable (requiere `pdftotext` de Poppler):

```sh
python3 scripts/extract-apu.py agua.pdf saneamiento.pdf ambiente.pdf -o catalogo-apu.csv
```

Después de importar los metrados, usa **Cargar catálogo APU CSV**. Solo propone rendimientos con código, descripción normalizada y unidad coincidentes. Las diferencias quedan pendientes. El rendimiento APU se identifica como referencia, conserva PDF y página de origen y requiere validación con la cuadrilla; no equivale a productividad observada. El convertidor elimina archivos idénticos, rechaza códigos repetidos y solicita revisión si MO y EQ difieren. La aplicación muestra vistas SVG derivadas de los DWG; los originales se descargan para abrirlos en CAD. Los APU pueden consultarse en el PDF original, con enlace a su página.

En `ejemplos/` hay un Excel con hojas **Cronograma** y **Metrados**, dos CSV y un XML de prueba. Las plantillas CSV también se descargan desde la aplicación. Al importar sobre la demostración se inicia un proyecto propio, sin mezclar ejemplos; el proyecto anterior queda recuperable en **Restaurar respaldo → Recuperar proyecto anterior**.

## Datos y trabajo sin conexión

El proyecto se guarda en `localStorage` de ese navegador. Tras la primera carga HTTP/HTTPS, el service worker permite reabrir la aplicación y consultar/calcular sin conexión, incluyendo el lector Excel empaquetado localmente. Exporta el respaldo JSON para traslado o recuperación. Se puede restaurar desde un archivo validado y exportar un reporte CSV.

No hay autenticación de roles, documentos adjuntos alojados, servidor compartido, sincronización automática ni resolución de conflictos entre dispositivos. Las revisiones son declaraciones registradas con un responsable, no firmas autenticadas. La operación local no garantiza conservación si se borra el almacenamiento del navegador; los respaldos son necesarios.

El pronóstico usa el rendimiento observado solo cuando hay cobertura diaria completa desde el primer registro hasta el corte, descontando interrupciones. En caso contrario usa el rendimiento planificado y lo indica. No estima un impacto contractual ni realiza optimización automática. La planificación pull de fases y la integración con sistemas institucionales quedan para una etapa posterior.

## Desarrollo y comprobaciones

```sh
npm run build
npm test
# Solo si cambias el lector Excel:
npm run build:excel
npm run build
# Con npm run dev activo y Playwright Python/Chromium disponibles:
python3 tests/browser_smoke.py
PITOCUNA_TEST_URL=http://127.0.0.1:8766/ python3 tests/workspace_browser.py
PITOCUNA_TEST_URL=http://127.0.0.1:8766/ python3 tests/plans_browser.py
```

- `engine.js`: calendario, Q/R, precedencias, alertas, preparación, compromisos, congelamiento, ejecución e indicadores.
- `importers.js`: validación de tablas CSV/Excel y lectura de XML.
- `app.js` / `app.css`: interfaz y persistencia local.
- `relations.js`: correspondencias documentales conservadoras y revisiones trazables.
- `workspace-ui.js` / `workspace.css`: resumen, actividades, ficha conectada y presentación móvil.
- `scripts/excel-entry.js`: entrada para empaquetar el lector; `vendor/` contiene su artefacto y licencia.
- `tests/`: casos de reglas y recorrido funcional de navegador. Sus salidas se excluyen de Git.

La validación incluye reglas de producción, metrados de expediente, cruce conservador de APU y una comprobación del sitio generado para Pages, lectura de Excel con dos hojas/CSV/XML, preparación → compromiso → congelamiento → avance → PPC y continuidad, persistencia tras recarga, respaldo, recarga sin conexión y navegación móvil de 390 px. Las pruebas versionadas utilizan datos ficticios. También se verificó localmente la lectura de los archivos de expediente aportados por el usuario; sus datos y documentos se publicaron posteriormente con autorización expresa del usuario.

## Corrección de publicación

Los intentos de Pages fallaban porque buscaban `/github/workspace/docs`, una carpeta inexistente. El sitio generado en `docs/` permite conservar la configuración seleccionada por el usuario. Antes de cada push de cambios de interfaz ejecuta `npm run build` y `npm test`; la prueba de despliegue detecta archivos ausentes o copias desactualizadas.

## Planos vinculados y carga del expediente

**Planos y expediente** relaciona 15 DWG únicos con 24 componentes, 705 registros de metrado y 718 tareas. Cada plano tiene sus partidas por especialidad y enlaces a metrados fuente, APU con página, cronograma XML y DWG original. Las instalaciones eléctricas de primaria se clasifican por el encabezado del Excel, ya que su código está dentro de un prefijo sanitario. La relación documental no homologa por sí sola WBS con códigos presupuestales ni certifica coincidencias geométricas.

El visor permite acercar, desplazar y marcar una partida en un punto del plano; las marcas se conservan en el respaldo y pueden retirarse. Las marcas no crean cantidades ejecutadas ni porcentajes de avance. Los SVG se cargan por demanda y se descomprimen en el navegador; la conversión de DWG se realizó fuera del cliente. Las vistas pueden omitir elementos, especialmente entidades complejas y planos sanitarios con coordenadas geográficas. El encuadre es una referencia visual; el original permite contrastarlos. Los documentos que se abren quedan disponibles en la caché para usos posteriores sin conexión.

`documents.js` valida relaciones y marcas, y `plans-ui.js` contiene la vista CAD. `project/` incluye el conjunto autorizado y sus fuentes. `python3 tests/plans_browser.py` verifica las vistas, los originales, las marcas y la navegación móvil con un servidor activo.
