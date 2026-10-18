# Pitocuna · Producción LPS + LBMS

> **Propuesta preliminar, sujeta a modificaciones y validación.** Prototipo de investigación; no acredita resultados de obra ni sustituye autorizaciones técnicas.

Aplicación web para relacionar cronograma, ubicaciones, metrados y rendimientos con Lookahead, liberación de restricciones, compromisos semanales y avance LBMS. Se preparó a partir del borrador de tesis de Bajo Pitocuna aportado por el usuario. Los archivos originales de referencia no se publican.

## Abrir y publicar

La entrada es `index.html`. GitHub Pages está configurado para publicar la rama `maqueta-pitocuna` desde **/docs**. `npm run build` copia el sitio completo a esa carpeta e incluye `.nojekyll`. Las fuentes se editan en la raíz; no edites las copias de `docs/` manualmente. Cuando Pages esté activado, el sitio esperado es https://23danycito2005.github.io/fdaso_2026/ . La comprobación externa depende del acceso de red del entorno; un push no demuestra por sí solo que el despliegue esté disponible.

Para desarrollar o probar localmente, usa un servidor HTTP; los módulos JavaScript no se ejecutan abriendo el archivo con `file://`:

```sh
npm ci --ignore-scripts
npm run dev
```

El servidor usa el puerto 8766. Node 24 se utilizó para la validación; Python 3 sirve los archivos locales. No hay base de datos remota ni secretos requeridos.

## Recorrido funcional

1. **Datos de obra:** importar cronograma `.xlsx`, `.csv` o MS Project `.xml`; `.mpp` debe exportarse a XML. Revisar hoja, fila de encabezado y asignación de columnas antes de confirmar. Las tareas resumen XML se excluyen; los hitos se conservan. Los vínculos distintos de fin–inicio sin desfase se señalan para revisión, y el calendario XML requiere confirmación manual.
2. **Ubicaciones y metrados:** relacionar por **código de partida + ubicación**. Diferenciar redes, reservorio y UBS; asignar grupo de flujo comparable, orden y cuadrilla. Registrar cantidad, unidad, rendimiento por jornada y su fuente. Q/R produce la duración; las unidades incompatibles o datos faltantes generan «no calculable».
3. **Lookahead:** ventana de 3, 4, 6 u 8 semanas con duraciones calculadas y trabajo atrasado como arrastre. Se conservan las fechas de referencia; el plan operativo considera Q/R, precedencias y secuencia de la misma cuadrilla.
4. **Preparación y restricciones:** vincular condiciones a una o varias actividades, responsable, fechas necesaria/estimada, evidencia y revisión. Una estimación no libera nada. La revisión de recursos, seguridad, calidad y frente debe confirmarse antes del compromiso; cambios relevantes la invalidan.
5. **Plan semanal:** definir cantidad comprometida y criterio de término; incorporar únicamente actividades preparadas y coincidentes con la ventana semanal. Congelar antes del inicio y de los registros de resultados. El congelamiento conserva miembros, ventanas, calendario y fechas necesarias; no permite añadir o retirar miembros posteriormente.
6. **Avance:** registrar cantidades diarias incrementales, evidencia y responsable dentro del corte observado. La entrega completa requiere confirmación adicional y el metrado íntegro. Los hitos tienen confirmación documentada sin cantidad. Las interrupciones se registran como intervalos de días completos; los coincidentes se consolidan.
7. **Indicadores:** PPC desde el cierre del alcance/criterio; PRL con fecha necesaria más temprana de vínculos congelados, sin duplicar restricciones compartidas; continuidad ponderada por jornadas actividad–ubicación, dentro del tiempo programado observado. Un denominador nulo se muestra como «no aplica». El reporte CSV y el historial permiten revisar el origen.

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
```

- `engine.js`: calendario, Q/R, precedencias, alertas, preparación, compromisos, congelamiento, ejecución e indicadores.
- `importers.js`: validación de tablas CSV/Excel y lectura de XML.
- `app.js` / `app.css`: interfaz y persistencia local.
- `scripts/excel-entry.js`: entrada para empaquetar el lector; `vendor/` contiene su artefacto y licencia.
- `tests/`: casos de reglas y recorrido funcional de navegador. Sus salidas se excluyen de Git.

Validación: 15 pruebas de reglas y una comprobación del sitio generado para Pages, lectura de Excel con dos hojas/CSV/XML, preparación → compromiso → congelamiento → avance → PPC y continuidad, persistencia tras recarga, respaldo, recarga sin conexión y navegación móvil de 390 px. Los escenarios utilizados son ficticios.

## Corrección de publicación

Los intentos de Pages fallaban porque buscaban `/github/workspace/docs`, una carpeta inexistente. El sitio generado en `docs/` permite conservar la configuración seleccionada por el usuario. Antes de cada push de cambios de interfaz ejecuta `npm run build` y `npm test`; la prueba de despliegue detecta archivos ausentes o copias desactualizadas.
