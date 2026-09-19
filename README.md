# Exacta7 · buscador clínico y vademécum

Base local del módulo solicitado: Next.js 16, React, TypeScript y paquetes reutilizables.

## Ejecución

Node.js >=22 y pnpm 11.19.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Abrir http://127.0.0.1:3000.

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

E2E utiliza Google Chrome instalado; CI instala Chrome con Playwright.

## Rutas

- `/`: buscador global y herramientas.
- `/medicamentos`, `/medicamentos/[slug]`: vademécum y fichas públicas regulatorias AEMPS/CIMA Vet.
- `/paciente`: especie y peso, conservados en sessionStorage de la pestaña.
- `/calculadoras/dose`, `/calculadoras/cri`, `/calculadoras/fluidos`.
- `/fuentes`: directorio y metodología.

El catálogo público incluye productos y presentaciones regulatorias autorizadas del nomenclátor AEMPS/CIMA Vet del 16/09/2026, con atribución, versión y enlaces oficiales. No hay recomendaciones clínicas ni dosis publicadas: la ficha de propofol sigue siendo una estructura de navegación vacía. Los únicos rangos sintéticos están en tests y nunca se incluyen en la aplicación. Las calculadoras ejecutan matemáticas con valores elegidos por el usuario; no validan la adecuación clínica.

El buscador funciona de manera determinista, sin LLM ni registro de consultas. Incluye productos regulatorios, principios activos, especies, vías y códigos nacionales de presentación. Al abrir una calculadora desde una ficha regulatoria, Exacta7 solo muestra concentraciones que aparecen expresamente en el nombre oficial AEMPS y exige verificar el producto físico; nunca selecciona indicación, vía ni dosis.

La aplicación está publicada en `https://exacta7.com` mediante Dokploy. Usa Supabase Auth/PostgreSQL y Stripe únicamente en modo de prueba hasta que se sustituyan las credenciales y precios por los de producción. Revisa `docs/SEARCH-ARCHITECTURE.md` para la evaluación Supabase/PostgreSQL y `docs/STATUS.md` para el estado operativo.
