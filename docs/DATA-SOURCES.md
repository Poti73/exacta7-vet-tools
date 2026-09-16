# Fuentes y licencias

| Fuente | Uso en esta entrega | Estado |
| --- | --- | --- |
| AEMPS/CIMA Vet | Enlace al portal; modelo de productos/presentaciones | No se ha importado ni publicado producto real. Licencia de reutilización pendiente de verificación. |
| AAHA 2020 | Título/enlace bibliográfico | Sin extracción de dosis ni reproducción de tablas. |
| WSAVA | Enlace a guías de dolor | Sin extracción de recomendaciones. |
| MSD | Referencia/enlace y seguimiento bibliográfico | Sin scraping ni copia de tablas/capítulos. |
| Marca Exacta7 | Imagen facilitada por el usuario, mostrada en header | Activo local suministrado para el diseño. |
| Inter / Manrope | Paquetes @fontsource, servidos localmente | Conservar licencias de los paquetes (OFL). |

## Importación AEMPS/CIMA Vet — 2026-09-16

- Archivo oficial: `prescripcionVET.zip`, obtenido de `https://listadomedicamentos.aemps.gob.es/prescripcionVET.zip`.
- Fecha declarada dentro del XML: 2026-09-16.
- SHA-256 del ZIP: `c91ced2ae82da27c239cebc77b1c334cad113e43290a38dba6cb761ebe4b4c91`.
- Aviso legal descargado y conservado para revisión: SHA-256 `2f19c452a7c096bf82a2ca41e82a947c49c5cfd9c70cab071551b7059bc1ebf4`.
- Resultado de staging local: 3.261 productos y 14.024 presentaciones; todos `PENDING_REVIEW`.
- No se importan recomendaciones clínicas, rangos, posologías ni CRI desde este fichero. La URL de la ficha técnica se conserva solo como enlace regulatorio.
- La aplicación pública no consume el staging. Su incorporación exige revisión humana, resolución de valores no mapeados, una decisión de publicación y una fuente/versionado asociado a cada registro.

El fichero oficial contiene tres IDs de principios activos no presentes en su diccionario distribuido (`9085`, `9086`, `9087`) en un producto porcino. El importador los conserva como `UNRESOLVED_AEMPS_ACTIVE:*` y no intenta asignarles un nombre.

Los enlaces del directorio no acreditan revisión clínica de una recomendación. Una futura importación debe registrar URL, fecha, ID, versión, licencia y atribución, conservar raw/staging y diff, pasar a PENDING_REVIEW y requerir publicación humana. Una actualización nunca publica automáticamente.
