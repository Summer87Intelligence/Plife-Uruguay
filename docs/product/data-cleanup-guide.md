# Guía de limpieza de datos QA

**Versión:** FASE 12G  
**Audiencia:** administradores y quienes corren pruebas manuales o Playwright visual

---

## Por qué existe esta guía

El **test visual manual** (`npm run test:e2e:manual:system`) y las pruebas exploratorias pueden **crear datos reales en Supabase** con sufijo **QA** para identificarlos fácilmente.

Si esos datos quedan mezclados con la demo oficial o con datos reales, confunden presentaciones y métricas.

Esta guía es **manual**. No incluye SQL destructivo ni scripts automáticos de borrado.

---

## Datos QA típicos

Creados por el walkthrough visual documentado en `tests/e2e/manual-system-walkthrough.spec.ts`:

| Tipo | Nombre / patrón típico |
|------|-------------------------|
| Empresa | `Estudio Contable Pérez QA` |
| Contacto | `Martín` + apellido `Pérez QA` |
| Oportunidad | `Protección para socios QA` |
| Campaña | `Estudios contables QA` |
| Email | direcciones `@example.com` u otros dominios de prueba |
| Texto libre | menciones a “QA”, “prueba”, “test” en notas |

Otros datos de prueba pueden aparecer si alguien cargó manualmente con el mismo criterio de nombres.

---

## Qué revisar

Revisar en este orden (de dependencias hacia arriba):

1. **Oportunidades** — buscar títulos con `QA`
2. **Contactos** — buscar apellido o nombre con `QA`
3. **Empresas** — buscar nombre con `QA`
4. **Campañas** — buscar nombre con `QA`
5. **Actividades / notas** asociadas a esos registros (si se ven en timeline)

Pantallas útiles:

- `/app/empresas` — búsqueda: `QA` o `Pérez QA`
- `/app/contactos` — búsqueda: `QA` o `Pérez`
- `/app/oportunidades` — búsqueda: `QA` o `Protección`
- `/app/campanas` — búsqueda: `QA` o `contables`

---

## Reglas de oro

| Regla | Detalle |
|-------|---------|
| **No borrar datos demo oficiales** | Si la demo usa “Estudio Contable Pérez” *sin* QA, es parte del guion — conservar. |
| **No borrar datos reales** | Si un cliente real tiene nombre parecido, **confirmar** antes de borrar. |
| **Solo borrar datos claramente QA** | Debe tener sufijo `QA` o ser obviamente de prueba acordada. |
| **Revisar asociaciones** | Una oportunidad QA puede estar ligada a empresa/contacto QA; borrar en orden lógico (oportunidad → contacto → empresa, o soft-delete desde UI si existe). |
| **No borrar en plena demo** | Limpiar *antes* o *después* de la sesión, no durante. |
| **Documentar** | Anotar qué se borró y cuándo (ticket o nota interna). |

---

## Checklist manual de limpieza

### Antes de una demo importante

- [ ] Buscar `QA` en Empresas — ¿hay resultados?
- [ ] Buscar `QA` en Contactos — ¿hay resultados?
- [ ] Buscar `QA` en Oportunidades — ¿hay resultados?
- [ ] Buscar `QA` en Campañas — ¿hay resultados?
- [ ] Confirmar que los datos demo oficiales (sin QA) siguen presentes si se necesitan
- [ ] Confirmar que no se borraron cuentas reales del equipo

### Después de correr test visual manual

- [ ] Listar registros creados (el test imprime resumen en consola)
- [ ] Eliminar oportunidades QA desde detalle o listado
- [ ] Eliminar contactos QA
- [ ] Eliminar empresas QA
- [ ] Eliminar campañas QA (si el rol lo permitió crearlas)
- [ ] Verificar Radar B2B y Hoy — ya no aparecen ítems QA
- [ ] Anotar en backlog si el test dejó datos huérfanos (bug a reportar)

### Si no estás seguro

- [ ] Preguntar al administrador o al dueño del dato
- [ ] **No borrar** hasta tener confirmación
- [ ] Preferir desactivar o marcar en notas internas si no hay borrado seguro en UI

---

## Cómo borrar (vía aplicación)

El sistema usa borrado lógico (`deleted_at`) en la mayoría de entidades comerciales.

1. Entrá al **detalle** del registro QA.
2. Usá **Editar** o la acción de eliminación si está disponible en esa pantalla.
3. Si no hay botón eliminar visible, coordinar con **admin** vía Supabase dashboard (fuera de alcance de esta guía — sin SQL aquí).

**Orden sugerido:**

1. Oportunidades QA  
2. Contactos QA  
3. Empresas QA  
4. Campañas QA  

---

## Qué NO hacer

- No ejecutar `DELETE` masivo en SQL sin backup y sin saber qué afecta.
- No borrar perfiles de usuario (`profiles`) de prueba sin rotar contraseñas si se usaron en demo.
- No confundir modo demo (`NEXT_PUBLIC_DEMO_MODE`) con datos QA — son cosas distintas.

---

## Referencias

- [admin-checklist.md](./admin-checklist.md) — después de demo  
- [qa-before-demo.md](./qa-before-demo.md) — antes de demo  
- [known-issues.md](./known-issues.md) — riesgo de datos QA en demo
