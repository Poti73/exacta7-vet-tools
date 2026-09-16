# Despliegue

El proyecto Dokploy `Exacta7 Vet Tools` dispone de un entorno `production`. El servicio web utiliza el `Dockerfile` de raíz: compila el monorepo con Node 22/pnpm y publica Next.js en el puerto 3000. El healthcheck consulta `/api/health`.

No se configura un dominio ni variables clínicas remotas en esta versión. Antes de exponerlo públicamente, asignar un dominio, TLS y completar revisión veterinaria, legal y de catálogo.

Esta entrega se valida localmente. No está desplegada y no se ha modificado VPS, DNS, Traefik, Dokploy ni servicios existentes.

Preparación para una futura entrega: conectar repositorio privado, CI obligatoria, Docker multi-stage, staging noindex, healthcheck /api/health y revisión de recursos VPS antes de crear un servicio aislado. No publicar hasta validar catálogo, autorización clínica y controles de seguridad. Credenciales fuera del repositorio.

Rollback local: volver al commit anterior cuando exista control de versiones. No se ha ejecutado inicialización git para no mezclar activos personales del directorio con el proyecto sin un inventario explícito.
