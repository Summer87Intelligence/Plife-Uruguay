# PLIFE Growth OS — Variables de Entorno

> Referencia técnica de todas las variables de entorno del sistema.
> **No incluir valores reales en este archivo ni en el repositorio.**

---

## NEXT_PUBLIC_SUPABASE_URL

| Campo       | Valor                                        |
|-------------|----------------------------------------------|
| Requerida   | Sí — la app no arranca sin esta variable      |
| Exposición  | Cliente + servidor (`NEXT_PUBLIC_*`)          |
| Entornos    | Local · Staging · Producción                 |
| Formato     | `https://<project-ref>.supabase.co`          |

**Descripción:** URL de la instancia de Supabase. Usada para inicializar el cliente de base de datos tanto en el servidor (Server Components, Route Handlers) como en el navegador.

**Riesgo si falta:** Error fatal en runtime al intentar crear cualquier cliente Supabase. La app queda inaccesible.

---

## NEXT_PUBLIC_SUPABASE_ANON_KEY

| Campo       | Valor                                        |
|-------------|----------------------------------------------|
| Requerida   | Sí — sin esta variable no se puede inicializar el cliente |
| Exposición  | Cliente + servidor (`NEXT_PUBLIC_*`)          |
| Entornos    | Local · Staging · Producción                 |
| Formato     | JWT largo (ey...)                             |

**Descripción:** Clave pública anónima de Supabase. Es segura para exponerse en el cliente porque RLS restringe el acceso a filas. **No confundir con la service_role key** (que nunca debe ir en el cliente).

**Riesgo si falta:** Mismo efecto que `NEXT_PUBLIC_SUPABASE_URL` — el cliente no puede inicializarse.

---

## OPENAI_API_KEY — REMOVIDA (FASE 15B)

> **Histórico / removido en FASE 15B.** El proyecto **no usa OpenAI** ni ningún
> proveedor externo de IA. Esta variable **ya no se requiere ni se lee** por el código.
> Los motores operan en **modo determinístico interno**. No configurar esta variable
> en ningún entorno.

---

## NEXT_PUBLIC_APP_URL

| Campo       | Valor                                        |
|-------------|----------------------------------------------|
| Requerida   | Recomendada (no estrictamente requerida)     |
| Exposición  | Cliente + servidor (`NEXT_PUBLIC_*`)          |
| Entornos    | Local (`http://localhost:3000`) · Staging · Producción |
| Formato     | URL absoluta sin barra final                 |

**Descripción:** URL base de la aplicación. Usada para construir links absolutos en emails, redirects OAuth y metadatos Open Graph. Si no está definida, los links relativos pueden fallar en ciertos contextos.

**Riesgo si falta:** Links incorrectos en emails de autenticación. OAuth puede fallar si Supabase usa esta URL como callback.

---

## NEXT_PUBLIC_DEMO_MODE

| Campo       | Valor                                        |
|-------------|----------------------------------------------|
| Requerida   | No — valor por defecto: `false`              |
| Exposición  | Cliente + servidor (`NEXT_PUBLIC_*`)          |
| Entornos    | Local (opcional) · Staging (`true`) · Producción (`false`) |
| Valores     | `true` \| `false`                            |

**Descripción:** Activa el modo de presentación demo. Cuando es `true`, la app muestra un banner informativo y puede habilitar comportamientos de demo (tours guiados, etc.). **No modifica datos ni desactiva RLS.** Es exclusivamente una bandera de UI.

**Riesgo si falta:** Comportamiento equivalente a `false` (modo normal). Sin riesgo.

**Riesgo si queda en `true` en producción real:** Confusión para usuarios reales que ven el banner de demo.

---

## Plantilla `.env.local`

```bash
# Supabase (requeridas)
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# (OpenAI removido en FASE 15B — no se requiere ninguna clave de proveedor de IA)

# App URL (recomendada)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Demo mode (opcional, default false)
NEXT_PUBLIC_DEMO_MODE=false
```

> El archivo `.env.local` está en `.gitignore` y **nunca debe commitearse**.

---

## Por entorno

| Variable                      | Local     | Staging   | Producción |
|-------------------------------|-----------|-----------|------------|
| NEXT_PUBLIC_SUPABASE_URL      | Requerida | Requerida | Requerida  |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Requerida | Requerida | Requerida  |
| ~~OPENAI_API_KEY~~ (removida 15B) | — | — | — |
| NEXT_PUBLIC_APP_URL           | Opcional  | Requerida | Requerida  |
| NEXT_PUBLIC_DEMO_MODE         | false     | true      | false      |
