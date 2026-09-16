# Seguridad clínica

- Búsqueda devuelve enlaces, contexto y herramientas; nunca una instrucción de administración.
- Ninguna dosis o concentración viene preseleccionada. El paciente aporta solo especie/peso, y se valida al recuperar sessionStorage.
- Indicación, vía, dosis/tasa, unidad y concentración requieren acción explícita. El peso no se transmite en URL.
- Toda concentración seleccionada se muestra antes del cálculo con confirmación de coincidencia con el producto físico. Cambiar concentración/unidad/presentación invalida la confirmación.
- Cambiar cualquier input, paciente o confirmación oculta el resultado anterior. Los estados y resultados de herramientas se aíslan por `case_id`; nunca se reutiliza el resultado de otro paciente.
- Un caso EXPIRED no puede ejecutar cálculos hasta que el profesional lo revise y reactive de forma explícita. Finalizar un caso borra sus datos locales y cálculos asociados tras confirmación.
- Concentraciones manuales se identifican como tales; no se presentan como datos AEMPS.
- La matemática usa Decimal, verifica entradas positivas, unidades y finitud. El límite 1e9 es computacional, NO un límite clínico. Se muestran fórmula, pasos, unidades, inputs y versión. Volumen con 10 cifras significativas, sin inferir resolución de jeringa o bomba.
- Los rangos clínicos solo aparecen con publicación humana y fuente de guideline/literatura. No hay rangos reales disponibles: la herramienta informa que no valida la adecuación de la dosis.
- Los fixtures de pruebas son datos sintéticos, identificados como TEST ONLY, fuera del bundle público.
- No existe un proceso clínico de aprobación en esta entrega. La estructura de publicación no sustituye autenticación, auditoría ni una revisión veterinaria real.

Antes de producción: revisión veterinaria del contenido y del flujo, importer staging con licencias verificadas, revisión legal, control de publicaciones con auditoría, análisis de rango/contexto y validación de precisión del dispositivo. No confundir un cálculo matemáticamente correcto con una pauta adecuada.
