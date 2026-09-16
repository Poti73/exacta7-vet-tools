# Retención y privacidad de casos clínicos locales

Exacta7 guarda los casos activos únicamente en el almacenamiento local del navegador (`localStorage`). No hay autenticación, sincronización, base de datos remota, analítica ni envío de datos clínicos en esta versión.

## Estados y ciclo de vida

- **ACTIVE:** caso temporal disponible para las herramientas. Su actividad se actualiza al editarlo o al guardar estado/cálculos de una herramienta.
- **EXPIRED:** tras 12 horas desde la última actividad, el caso deja de poder alimentar cálculos. El profesional debe revisarlo y reactivarlo de forma explícita o eliminarlo.
- **FINISHED:** al elegir “Finalizar caso” y confirmarlo, se eliminan en ese navegador el caso, sus estados de herramientas y todos sus cálculos asociados.
- **SAVED:** estado reservado para una futura modalidad PRO. No se ofrece guardado remoto ni sincronización en esta versión.

Se muestra un aviso de revisión a las 8 horas de inactividad. La expiración no borra en silencio el registro: permite al profesional decidir si lo revisa, reactiva o elimina. Borrar los datos del sitio desde el navegador también elimina estos casos.

## Datos y aislamiento

Cada caso recibe un UUID inmutable (`case_id`). Cada cálculo recibe otro UUID (`calculation_id`) y conserva el `case_id`, tipo de herramienta y fecha de creación. La aplicación rechaza registros locales malformados o cálculos asociados a otro caso. Al cambiar de caso, el estado de cada herramienta y sus resultados se restauran solo para el caso seleccionado.

Se recogen solo alias opcional, especie, peso, ASA y los campos clínicos opcionales de edad, sexo y estado reproductivo. No se piden ni almacenan datos del propietario.

## Modalidades

La modalidad gratuita permite varios casos temporales locales. Las capacidades PRO de guardado, historial y sincronización no están implementadas: requerirán autenticación, consentimiento, retención configurable y controles de acceso antes de activarse.

## Analítica futura

No hay Google Analytics ni otro proveedor de analítica instalado. Si se incorpora medición, solo se registrarán eventos agregados sin identificadores clínicos ni datos de pacientes, por ejemplo creación, cambio, finalización o expiración de un caso.
