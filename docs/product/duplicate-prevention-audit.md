# Duplicate Prevention Audit — PLIFE Growth OS (FASE 13E)

Auditoría de creación de empresas y contactos, y propuesta de validación anti-duplicados sin migraciones ni cambios en Supabase.

## 1. Flujo actual de creación de empresa

| Paso | Ubicación | Detalle |
|------|-----------|---------|
| UI | `src/app/app/empresas/companies-list.tsx`, `src/app/app/radar-b2b/radar-b2b-view.tsx` | Dialog "Nueva empresa" con `CompanyForm` |
| Formulario | `src/app/app/empresas/company-form.tsx` | Client component: trim de `name`/`location`, validación de rangos numéricos |
| Server action | `src/domains/companies/actions.ts` → `createCompany` | Auth → `CompanySchema` (Zod) → limpieza de vacíos → `INSERT` en `companies` |
| Post-creación | `CreateSuccessPanel` | Link a contacto nuevo o detalle de empresa |

No hay API routes. No hay búsqueda previa ni detección de duplicados.

## 2. Flujo actual de creación de contacto

| Paso | Ubicación | Detalle |
|------|-----------|---------|
| UI | `src/app/app/contactos/contacts-list.tsx`, `src/app/app/empresas/[id]/company-detail.tsx` | Dialog "Nuevo contacto"; soporta `?nuevo=1&empresa={id}` |
| Formulario | `src/app/app/contactos/contact-form.tsx` | Trim de nombres/email; regex de email en cliente |
| Server action | `src/domains/contacts/actions.ts` → `createContact` | Auth → `ContactSchema` (Zod) → limpieza → `INSERT` en `contacts` |
| Post-creación | `CreateSuccessPanel` | Link a oportunidad nueva o detalle de contacto |

## 3. Campos útiles para detectar duplicados

### Empresa (`companies`)

| Campo | Utilidad | Notas |
|-------|----------|-------|
| `name` | Alta | Principal candidato; sin UNIQUE en BD |
| `website` | Alta | Dominio normalizable |
| `linkedin_url` | Media | Perfil normalizable |
| `instagram_url` | Media | Perfil normalizable |
| `industry`, `location` | Baja | Contexto, no identificadores |
| `email`, `teléfono` | N/A | No existen en el modelo actual |

### Contacto (`contacts`)

| Campo | Utilidad | Notas |
|-------|----------|-------|
| `email` | Alta | Match exacto normalizado (case-insensitive) |
| `phone` | Alta | Dígitos normalizados (sin formato) |
| `first_name` + `last_name` + `company_id` | Media | Similitud de nombre dentro de la misma empresa |
| `linkedin_url` | Media | No está en el formulario UI actual |

## 4. Riesgos actuales

1. **Duplicados silenciosos**: `createCompany` y `createContact` insertan sin consulta previa.
2. **Solo validación de forma**: Zod valida tipos y rangos, no unicidad.
3. **Normalización mínima**: trim en cliente; sin `toLowerCase` en email ni normalización de teléfono.
4. **Sin constraints de negocio en repo**: `database.ts` y SQL versionado no declaran UNIQUE sobre `name` o `email`.
5. **Soft delete**: registros con `deleted_at` no deben contarse como duplicados activos.
6. **Validación solo en frontend sería insuficiente**: bypass vía server action directa; la verificación debe vivir en el servidor.

## 5. Qué se puede validar sin Supabase nuevo

- Consulta de lectura antes del `INSERT` en server actions (`queryCompanyDuplicates`, `queryContactDuplicates`).
- Normalización en código: texto, email, teléfono, dominio web.
- Similitud de nombres con umbral conservador (≥ 0.85) para reducir falsos positivos.
- Advertencia no bloqueante con confirmación explícita (`confirmDuplicates: true`).
- Filtrar `deleted_at IS NULL` en todas las consultas.
- Tests unitarios de funciones puras de normalización y scoring.

## 6. Qué requeriría migración futura

- `UNIQUE` parcial en `companies(name)` o `companies(normalized_name)` con índice funcional.
- `UNIQUE` parcial en `contacts(email)` donde `email IS NOT NULL`.
- Columnas materializadas: `normalized_name`, `phone_digits`, `website_domain`.
- Trigger de deduplicación o merge de registros existentes.
- Bloqueo duro server-side garantizado ante race conditions concurrentes.

## 7. Propuesta de implementación segura para esta fase

1. Módulo `src/domains/duplicates/` con normalización y checks reutilizables.
2. En `createCompany` / `createContact`: ejecutar check antes del insert.
3. Si hay coincidencias y no hay `confirmDuplicates`, devolver `{ duplicates }` sin insertar.
4. En formularios: mostrar `DuplicateWarningPanel` con CTA "Ver empresa/contacto" y "Crear de todos modos".
5. Mantener umbral conservador; priorizar matches fuertes (email, teléfono, web) sobre similitud de nombre.
6. Documentar que bloqueo estricto y constraints de BD quedan para fase futura.

---

## Diseño funcional propuesto

### Empresas

- Antes de crear, buscar coincidencias por nombre normalizado.
- Considerar duplicado probable si:
  - nombre muy similar (≥ 85 %)
  - mismo sitio web si existe
  - mismo LinkedIn/Instagram si existe
- Si hay coincidencia, **no bloquear duro** inicialmente.
- Mostrar advertencia clara:
  > "Ya existe una empresa parecida. Revisala antes de crear otra."
- Permitir continuar solo si el usuario confirma explícitamente ("Crear de todos modos").

### Contactos

- Antes de crear, buscar coincidencias por:
  - email exacto (normalizado)
  - teléfono exacto/normalizado (≥ 8 dígitos)
  - nombre parecido dentro de la misma empresa
- Email exacto → advertencia **fuerte**.
- Teléfono exacto → advertencia **fuerte**.
- Nombre parecido sin email/teléfono → advertencia **suave**.

### Reglas de esta fase

- No inventar constraints de base.
- No tocar Supabase remoto ni SQL.
- No depender solo del frontend: verificación en server action.
- Bloqueo/confirmación estricta con constraint UNIQUE queda documentada para fase futura.

### Implementación realizada (13E)

| Artefacto | Rol |
|-----------|-----|
| `src/domains/duplicates/normalize.ts` | `normalizeText`, `normalizeEmail`, `normalizePhone`, `nameSimilarity` |
| `src/domains/duplicates/company-duplicate-check.ts` | `findPotentialCompanyDuplicates`, `queryCompanyDuplicates` |
| `src/domains/duplicates/contact-duplicate-check.ts` | `findPotentialContactDuplicates`, `queryContactDuplicates` |
| `src/components/ui/duplicate-warning.tsx` | Panel de advertencia con CTAs |
| `src/domains/companies/actions.ts` | Check pre-insert + flag `confirmDuplicates` |
| `src/domains/contacts/actions.ts` | Check pre-insert + flag `confirmDuplicates` |
| `src/app/app/empresas/company-form.tsx` | UX de advertencia empresa |
| `src/app/app/contactos/contact-form.tsx` | UX de advertencia contacto |
