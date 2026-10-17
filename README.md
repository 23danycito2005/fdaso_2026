# Pitocuna · Aplicación integrada LPS + LBMS

> **Propuesta preliminar, sujeta a modificaciones y validación.** El diseño, las funciones y los criterios de cálculo podrán ajustarse durante el desarrollo de la tesis.

Demo interactiva para gestión de restricciones y avance por ubicación en saneamiento rural.

## Abrir la aplicación

**`index.html` es la aplicación completa.** Incluye Inicio, Restricciones, Campo y Avance de obra en una sola navegación. El dibujo del tramo T-02 abre la ficha de restricción R-001. No necesita instalaciones ni servicios externos para consultar la demo.

`presentacion.html` explica el proceso y enlaza con la aplicación. Los enlaces antiguos `propuestas.html` y `avance-obra.html` redirigen a la aplicación integrada.

## Publicar con GitHub Pages

La aplicación está preparada para publicación estática desde la raíz de la rama `maqueta-pitocuna`, con `.nojekyll` y navegación mediante fragmentos de URL.

1. Abre [Settings → Pages](https://github.com/23danycito2005/fdaso_2026/settings/pages).
2. En **Build and deployment → Source**, elige **Deploy from a branch**.
3. Selecciona **maqueta-pitocuna**, carpeta **/ (root)** y pulsa **Save**.
4. Espera a que GitHub confirme el despliegue y muestre **Visit site**.

La dirección esperada tras una publicación exitosa es `https://23danycito2005.github.io/fdaso_2026/`. No se ha confirmado la activación ni la disponibilidad de esa dirección desde el entorno de trabajo: su red bloquea `api.github.com` y `23danycito2005.github.io`. Subir los archivos al repositorio no habilita Pages por sí solo.

Si GitHub indica que Pages no está disponible, revisa la visibilidad del repositorio y las condiciones del plan antes de cambiar esas opciones.

## Uso local

Descarga con **Code → Download ZIP**, extrae y abre `index.html`. También se incluye `pitocuna-completo.zip` con la aplicación y la documentación. El archivo principal contiene las vistas y gráficos integrados, sin iframes ni dependencias de red.

## Validación

Verificado en Chromium a 1440 px y 390 px: navegación de las cuatro secciones, búsqueda, detalle de restricciones, filtro de campo, cortes de avance J7/J9/J15, vistas de esquema y tiempo–ubicación, vínculo T-02 → R-001, compatibilidad de enlaces anteriores y ausencia de errores de JavaScript. Esta validación es local y no demuestra que GitHub Pages esté publicado.

## Alcance

Es una demo con datos ficticios. Permite consultar los registros de prueba y recorrer el avance simulado. Registro y edición de información real, usuarios, evidencias y sincronización con servidor siguen pendientes de implementación. Las UBS tienen una zona reservada para su futuro diseño. El gráfico no acredita resultados de obra ni conformidad técnica.

Los documentos originales de referencia aportados por el usuario no se incluyen en este repositorio.
