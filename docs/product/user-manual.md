# Manual de uso — PLIFE Growth OS

> **Histórico (FASE 15B):** OpenAI fue removido del proyecto. Las menciones a OpenAI / GPT / `OPENAI_API_KEY` son registro histórico; los motores operan en modo determinístico interno.
>
> **Histórico (FASE 15C):** Compliance fue removido del producto (sección, menú, ruta y flujo). Las menciones a "Compliance" son registro histórico. Ver `docs/product/compliance-removal-15c.md`.

**Versión:** FASE 12F  
**Audiencia:** asesores comerciales, líderes comerciales, dirección y administración  
**Idioma:** español (Uruguay)

---

## 1. Qué es PLIFE Growth OS

PLIFE Growth OS es el sistema comercial de PLIFE para organizar el trabajo diario del equipo: empresas, contactos, oportunidades, campañas, seguimientos y revisión de mensajes.

No es un reemplazo del asesor. **Ordena, prioriza y ayuda a tomar mejores decisiones comerciales.**

---

## 2. Para qué sirve

Sirve para:

- Ver qué hacer hoy (seguimientos, oportunidades, campañas).
- Registrar empresas y contactos en un solo lugar.
- Seguir conversaciones comerciales en un pipeline claro.
- Coordinar campañas por segmento.
- Priorizar empresas con potencial (Radar B2B).
- Revisar mensajes antes de enviarlos (Compliance).
- Consultar material validado (Conocimiento).
- Ver el panorama del equipo (Dirección).

---

## 3. Qué hacer al entrar por primera vez

1. Iniciá sesión con tu usuario y contraseña.
2. Entrá a **PLIFE Hoy** (`/app/hoy`).
3. Si no hay datos, buscá el bloque **¿Por dónde empiezo?**
4. Seguí el orden recomendado (ver sección 4).
5. No te preocupes si el Copiloto IA no genera sugerencias: en demo la IA avanzada puede estar desactivada. **Eso no significa que el sistema esté roto.**

---

## 4. Orden recomendado de trabajo

```
Empresa → Contacto → Oportunidad → Campaña → Seguimiento → Compliance → Dirección
```

| Paso | Dónde | Qué hacés |
|------|--------|-----------|
| 1 | Empresas | Cargás la empresa cliente o prospecto |
| 2 | Contactos | Registrás a la persona con la que hablás |
| 3 | Oportunidades | Abrís una conversación comercial concreta |
| 4 | Campañas | Organizás el esfuerzo por segmento (si aplica) |
| 5 | Seguimiento | Definís próximo paso y fecha |
| 6 | Compliance | Revisás el mensaje antes de enviarlo |
| 7 | Dirección | Mirás el panorama del equipo (roles de dirección) |

Después de crear una empresa, el sistema sugiere agregar un contacto. Después de un contacto, sugiere crear una oportunidad.

---

## 5. Secciones del sistema

### PLIFE Hoy (`/app/hoy`)

**Qué muestra:** tu tablero diario — seguimientos vencidos, próximas acciones, oportunidades en etapa avanzada, empresas asignadas y campañas activas.

**Cuándo usarla:** al empezar el día, para saber qué atender primero.

**Qué acción tomar:** revisá seguimientos vencidos y próximas acciones; entrá al detalle desde cada ítem.

**Error común:** pensar que está vacío porque “no hay IA”. El tablero funciona con o sin IA configurada.

---

### Recorrido demo (`/app/demo`)

**Qué muestra:** guía paso a paso para mostrar el valor del sistema en una demo.

**Cuándo usarla:** en presentaciones comerciales o capacitaciones internas.

**Qué acción tomar:** seguí los pasos en orden y mostrá el flujo completo.

**Error común:** usar solo la demo sin cargar datos propios en uso real.

---

### Empresas (`/app/empresas`)

**Qué muestra:** listado de empresas B2B con rubro, ciudad, potencial comercial y estado.

**Cuándo usarla:** cuando identificás un prospecto o cliente empresa.

**Qué acción tomar:** **Nueva empresa** → completá nombre, rubro, ciudad y próximo paso sugerido → desde el detalle usá **Acciones rápidas** para agregar contacto u oportunidad.

**Error común:** crear oportunidades sin empresa ni contacto asociado.

---

### Contactos (`/app/contactos`)

**Qué muestra:** personas con cargo, empresa asociada, nivel de interés y próximo seguimiento.

**Cuándo usarla:** cuando tenés un interlocutor concreto.

**Qué acción tomar:** **Nuevo contacto** → vinculá la empresa → definí próxima acción y fecha.

**Error común:** cargar contactos sueltos sin empresa cuando el trabajo es B2B.

---

### Oportunidades (`/app/oportunidades`)

**Qué muestra:** pipeline comercial por etapas (vista pipeline o lista).

**Cuándo usarla:** cuando hay una conversación comercial real (no solo un nombre en una lista).

**Qué acción tomar:** **Nueva oportunidad** → nombre, etapa, próximo paso y fecha de seguimiento → mové la etapa según avance.

**Error común:** no registrar el próximo paso; el pipeline se enfría.

---

### Campañas (`/app/campanas`)

**Qué muestra:** campañas por segmento con objetivo, mensaje inicial y métricas.

**Cuándo usarla:** para coordinar al equipo en un segmento (pymes, estudios contables, etc.).

**Qué acción tomar:** **Nueva campaña** (roles con permiso) → segmento, objetivo comercial y mensaje inicial.

**Error común:** asumir que todos los usuarios pueden crear campañas; algunos roles solo las ven.

---

### Radar B2B (`/app/radar-b2b`)

**Qué muestra:** empresas ordenadas por potencial comercial, con perfil de cliente y próximo paso sugerido.

**Cuándo usarla:** para decidir a qué empresas dedicar tiempo primero.

**Qué acción tomar:** filtrá por potencial → expandí **Análisis** → creá oportunidad o guardá potencial sugerido.

**Error común:** esperar resultados sin empresas cargadas con rubro y tamaño.

---

### Compliance (`/app/compliance`)

**Qué muestra:** revisor de mensajes e historial de revisiones IA.

**Cuándo usarla:** **antes de enviar** un mensaje comercial al cliente.

**Qué acción tomar:** pegá el mensaje → **Revisar mensaje** → corregí según el resultado.

**Error común:** enviar promesas de cobertura o rentabilidad sin revisar.

---

### Copiloto IA (`/app/copiloto`)

**Qué muestra:** asistencia para preparar contactos, objeciones y próximos pasos.

**Cuándo usarla:** cuando necesitás ayuda para redactar o planificar (con IA configurada).

**Qué acción tomar:** elegí tipo de ayuda, asociá contacto u oportunidad, escribí el contexto.

**Error común:** interpretar “IA no configurada” como error del sistema. La estructura comercial sigue funcionando.

---

### Conocimiento (`/app/conocimiento`)

**Qué muestra:** documentos validados que el equipo (y la IA, si está activa) usa como referencia.

**Cuándo usarla:** para consultar guiones, FAQs y material aprobado.

**Qué acción tomar:** buscá por tema; los roles de administración cargan y activan documentos.

**Error común:** asumir que todo el contenido está indexado sin que administración lo haya activado.

---

### Dirección (`/app/direccion`)

**Qué muestra:** vista ejecutiva — pipeline del equipo, actividad reciente, top oportunidades B2B.

**Cuándo usarla:** para decidir dónde enfocar recursos (roles dirección/admin).

**Qué acción tomar:** revisá distribución del pipeline y oportunidades destacadas.

**Error común:** confundirla con PLIFE Hoy; Hoy es operativo diario, Dirección es analítica.

---

### Admin / System (`/app/admin`, `/app/admin/system`)

**Qué muestra:** gestión de usuarios y configuración del sistema.

**Cuándo usarla:** solo administración técnica o de producto.

**Qué acción tomar:** crear usuarios, revisar roles, no exponer credenciales en demos.

**Error común:** compartir pantalla con claves o variables de entorno visibles.

---

## 6. Ejemplo práctico completo

**Empresa:** Estudio Contable Pérez  
- Rubro: Estudio contable  
- Ciudad: Montevideo  
- Tamaño: ~8 empleados  
- Próximo paso sugerido: pedir reunión con el socio fundador  

**Contacto:** Martín Pérez  
- Cargo: Socio fundador  
- Empresa: Estudio Contable Pérez  
- Próxima acción: llamada de presentación (con fecha)  

**Oportunidad:** Protección para socios  
- Tipo: B2B  
- Etapa: Nueva  
- Próximo paso: enviar propuesta conceptual  

**Campaña:** Estudios contables  
- Segmento: estudios de 5 a 20 personas  
- Objetivo: 10 reuniones en 60 días  
- Mensaje inicial: redactado y alineado al segmento  

**Compliance:** antes de enviar el mensaje de apertura, pegarlo en el revisor y corregir si hay frases riesgosas.

---

## 7. Modo demo vs uso real

| Aspecto | Modo demo | Uso real |
|---------|-----------|----------|
| Datos | Ejemplos precargados | Los carga el equipo |
| Bloque “¿Por dónde empiezo?” | Visible con datos de ejemplo | Visible si no hay datos |
| Copiloto IA | Puede estar desactivado | Se activa cuando administración configura IA |
| Objetivo | Mostrar el flujo punta a punta | Operar el negocio día a día |

En demo se muestra el recorrido sugerido (`/app/demo`). En uso real el valor aparece cuando cargás tus propias empresas, contactos y oportunidades.

---

## 8. Sobre la IA en esta demo

**La IA avanzada puede estar desactivada en esta demo. Eso no significa que el sistema esté roto.**

Siguen funcionando:

- Empresas, contactos, oportunidades y campañas  
- Pipeline y seguimientos  
- Compliance (revisor de mensajes)  
- Base de conocimiento  
- Radar B2B (priorización sin depender de OpenAI)  

El Copiloto requiere configuración adicional para generar sugerencias automáticas.

---

## 9. Cierre

PLIFE Growth OS no reemplaza al asesor.

**Ordena, prioriza y ayuda a tomar mejores decisiones comerciales.**

Para flujo operativo resumido, ver también [operational-flow.md](./operational-flow.md).  
Para validación antes de una demo, ver [qa-before-demo.md](./qa-before-demo.md).
