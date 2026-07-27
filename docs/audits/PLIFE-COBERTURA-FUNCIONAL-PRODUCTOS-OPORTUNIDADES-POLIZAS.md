# Auditoría de cobertura funcional — Productos, Oportunidades y Pólizas de Plife Uruguay

**Fecha:** 2026-07-25
**Autor:** Auditoría funcional (continuación de la Auditoría 360°)
**Pregunta que responde este documento:** ¿Todos los servicios y productos que Plife Uruguay ofrece están correctamente contemplados en el CRM mediante catálogo, oportunidades, pólizas, datos mock, pantallas, indicadores y motores inteligentes?
**Fuente principal de verdad:** oferta publicada por Plife Uruguay (`plifeuruguay.com`). MAPFRE Uruguay se usa solo para completar atributos técnicos, nunca para asumir productos. MAPFRE España es solo referencia terminológica.
**Método:** lectura de código/mocks/documentación del proyecto + validación en vivo con Playwright MCP (`localhost:3001`, servidor reiniciado en la auditoría anterior). No se modificó código, datos ni archivos existentes — este es el único documento nuevo creado.

---

## 1. Respuesta ejecutiva

> **PARCIALMENTE — y con una salvedad importante: ni siquiera se puede afirmar que el CRM cubra bien los productos de Plife, porque el CRM no modela ningún producto específico de Plife ni de MAPFRE. Lo que existe es un catálogo genérico de corredora multi-ramo/multi-aseguradora que no fue diseñado a partir de la oferta real de Plife.**

De los **2 productos/servicios confirmados** en la web de Plife Uruguay:
- **0** están completamente representados en el CRM.
- **1** está parcialmente representado (existe el ramo "Vida" y hay 13 pólizas Vida+Mapfre en los datos demo, pero sin producto nombrado, sin capital, sin beneficiarios, sin ficha adecuada, sin motor inteligente, y sin ninguna oportunidad que lo mencione específicamente).
- **1** está completamente ausente (el "Seguro Internacional de Salud" no tiene ningún ramo ni producto equivalente en el proyecto — no existe un ramo "Salud").

Con datos duros de la cartera demo: de **785 pólizas**, solo **68 (8,7%)** son del ramo "Vida", y de esas 68, solo **13 (1,7% del total)** son de la aseguradora Mapfre. El caso que debería ser el corazón del negocio (vida individual + Mapfre) es hoy una fracción marginal de los datos, las pantallas y la lógica del sistema — y, como se documenta en el Capítulo 7, el propio dashboard de Dirección genera una alerta ejecutiva sobre "dependencia de BSE", lo que confirma que el sistema **razona explícitamente** sobre un modelo de negocio distinto al declarado para Plife.

---

## 2. Catálogo confirmado de Plife Uruguay

Fuente: `plifeuruguay.com` (páginas `/los-productos/`, `/la-industira/`, `/carrera/`, `/la-oportunidad-de-ganar-crecer-y-disfrutar/`), ya releladas en la Auditoría 360° previa. No se agregó investigación web nueva en este documento — se reorganiza la evidencia ya obtenida bajo la distinción producto/cobertura/beneficio/concepto pedida.

| Nombre utilizado por Plife | Categoría | Necesidad que resuelve | Evidencia / fuente | Nivel de confirmación | Tipo |
|---|---|---|---|---|---|
| "Seguro de vida entera con ahorro para jubilación" (sin nombre comercial propio publicado) | Vida + ahorro/jubilación | Protección patrimonial, sucesión, ingreso vitalicio garantizado | `plifeuruguay.com/los-productos/` | Confirmado que Plife lo ofrece; **PENDIENTE DE VALIDAR CON PLIFE** a qué producto MAPFRE específico corresponde (candidatos: PLUS, VIP o Ahorro Seguro — ver auditoría anterior) | Producto comercial |
| "Seguro Internacional de Salud" | Salud internacional | Cobertura de salud a nivel internacional | `plifeuruguay.com/los-productos/` o `/la-industira/` | Confirmado que Plife lo publica; **PENDIENTE DE VALIDAR CON PLIFE** si es un producto MAPFRE o de un tercero — no aparece en el catálogo de MAPFRE Uruguay relevado, lo cual es una alerta de posible incumplimiento de la regla de exclusividad | Producto comercial (origen del proveedor sin confirmar) |
| "Carrera" / "La Oportunidad de Ganar, Crecer y Disfrutar" | Desarrollo de fuerza de ventas | Generación de ingresos por comisión para el agente — **no es una necesidad de un cliente asegurado** | `plifeuruguay.com/carrera/`, `/la-oportunidad-de-ganar-crecer-y-disfrutar/` | Confirmado | Concepto comercial (reclutamiento de agentes, no producto ni cobertura para clientes finales — excluido de las matrices de cobertura de este documento por no ser un servicio asegurador) |

**Coberturas y beneficios mencionados que NO son productos independientes** (aclaración pedida explícitamente — evitar que una cobertura se cuente como producto aparte):
- Coberturas del producto de vida+ahorro: fallecimiento, enfermedad terminal, desmembramiento por accidente.
- Beneficios del mismo producto: valores en efectivo garantizados libres de impuestos al cobro, opciones de liquidación de ingreso programado a 10/15/20/25 años, protección ante devaluación/inflación, cláusula de incontestabilidad, inalienabilidad.

**Total: 2 productos comerciales confirmados en la web de Plife.** Ningún nombre comercial específico de MAPFRE (ni de los 12 relevados en la auditoría anterior) aparece mencionado en ningún lugar del sitio de Plife.

---

## 3. Auditoría del catálogo existente en el proyecto

Fuente verificada directamente en código (no en documentación derivada):

- **Aseguradoras modeladas** (`src/lib/demo/pools.ts:198`, `ASEGURADORAS_DEMO`): `BSE, Porto Seguro, Mapfre, SURA, Zurich, HDI` — con pesos de participación de mercado (`ASEGURADORA_WEIGHTS`): BSE 30, Mapfre 18, SURA 17, Porto Seguro 15, Zurich 12, HDI 8. Mapfre no es la única ni la dominante.
- **Ramos modelados** (`pools.ts:205`, `RAMOS_DEMO`): `Vehículos, Responsabilidad civil, Accidentes de trabajo, Vida, Incendio, Transporte, Hogar, Comercio` — 8 ramos, Vida es 1 de 8.
- **Productos por ramo** (`pools.ts:235`, `PRODUCTOS_POR_RAMO`) — para el ramo "Vida": `['Vida colectiva de socios', 'Vida individual ejecutivo', 'Vida saldo deudor']`. Estos tres nombres son **genéricos/inventados para la demo**: no coinciden textualmente con ninguno de los 2 productos confirmados de Plife (Cap. 2) ni con ninguno de los 12 productos oficiales de MAPFRE Uruguay relevados en la Auditoría 360° previa (TC1, TC5, TC10, PLUS, VIP, Ahorro Seguro, Vida Educacional, Protección Total, MEDIMAPFRE, Oncológico, Accidentes Personales Más Vida, AP Senior).
- **Prototipo estático** (`src/domains/policies/mock-data.ts`, 8 pólizas usadas fuera de modo demo): solo 1 de 8 es ramo Vida ("Vida colectiva de socios", aseguradora **SURA**, no Mapfre).

**Respuestas directas a lo pedido:**
- ¿Qué productos están modelados? Solo los 3 nombres genéricos de la lista `PRODUCTOS_POR_RAMO['Vida']`, más listas equivalentes para los otros 7 ramos.
- ¿Los nombres corresponden con Plife? No — ninguno coincide con el catálogo confirmado del Capítulo 2.
- ¿Hay productos inventados? Sí — los 3 nombres del ramo Vida (y, por extensión, todos los `PRODUCTOS_POR_RAMO`) son de fantasía verosímil, no reales.
- ¿Hay productos de otras aseguradoras? Sí — 5 de 6 aseguradoras del universo demo no son Mapfre.
- ¿Hay ramos distintos de Vida? Sí — 7 de 8.
- ¿Existen categorías genéricas que ocultan diferencias importantes? Sí — el campo `product` es un string elegido al azar de una lista corta por ramo, sin ningún atributo asociado (capital, edad, exclusiones, tipo de prima). Oculta por completo las diferencias reales entre, por ejemplo, un TC1 (protección pura) y un Ahorro Seguro (producto mixto con rescate) — ambos quedarían indistinguibles bajo la misma etiqueta "Vida" si se cargaran hoy.

---

## 4. Auditoría de oportunidades

Fuente: `DEMO_OPORTUNIDADES` (40 abiertas) y `DEMO_OPORTUNIDADES_HISTORICAS` (75: 45 ganadas + 30 perdidas) en `src/lib/demo/universe.ts`, generadas por `buildOpportunity()`.

| Verificación pedida | Resultado |
|---|---|
| ¿Existe al menos una oportunidad mock asociada a un producto de Plife? | No — ninguna oportunidad referencia el producto "vida entera + ahorro" ni "Seguro Internacional de Salud" del Capítulo 2 |
| ¿La oportunidad identifica claramente el producto? | No — `suggested_product: branch` (`universe.ts:614`) asigna literalmente el **nombre del ramo** (ej. "Vida", "Incendio"), no un producto |
| ¿Expresa una necesidad real del cliente? | Parcial — plantilla fija: `` `Necesidad de cobertura de ${branch.toLowerCase()} detectada en seguimiento comercial` `` (`universe.ts:613`), no derivada de datos reales de un cliente |
| ¿Tiene etapa comercial? | Sí — `stage`, 8 valores en el pipeline abierto |
| ¿Tiene monto o prima estimada? | Sí — `estimated_value`, aleatorio entre 20.000 y 380.000 |
| ¿Tiene asesor responsable? | Sí — `assigned_to` |
| ¿Tiene próxima acción? | Sí, salvo las cerradas |
| ¿Puede convertirse conceptualmente en cotización y póliza? | Débilmente — no hay ningún campo que vincule la oportunidad a un producto real del catálogo (ni de Plife ni de MAPFRE), por lo que no se puede validar si lo que eventualmente se emite coincide con lo que se originó |

**Hallazgo adicional**: `type: 'b2b'` es fijo para las 40 oportunidades abiertas generadas por el código (`universe.ts:607`) — pese a que el tipo de dato admite `b2c` y `reclutamiento`, el generador nunca produce ninguna de esas dos variantes. Esto significa que, en la práctica, el mock actual **no representa ningún caso de venta directa a una persona individual** (el escenario B2C, que es presumiblemente el núcleo real del negocio de vida individual).

**Oportunidades marcadas como genéricas/ambiguas**: las 40 abiertas y las 75 históricas, **sin excepción** — por diseño del generador, ninguna nombra un producto real, todas usan el ramo como proxy de producto.

---

## 5. Auditoría de pólizas

### 5.1 Datos duros (validados en vivo con Playwright, `/app/polizas`, filtros combinados)

| Filtro aplicado | Resultado mostrado por la UI |
|---|---|
| Sin filtro | **785** de 785 pólizas |
| Ramo = Vida | **68** de 785 pólizas |
| Ramo = Vida **y** Aseguradora = Mapfre | **13** de 785 pólizas |

Es decir: **el segmento que debería representar el negocio central de Plife (vida individual + Mapfre) es el 1,7% de la cartera demo.**

Prototipo estático (`MOCK_POLICIES`, 8 pólizas): 1 de ramo Vida, aseguradora SURA — **0 pólizas Vida+Mapfre** en el set chico.

### 5.2 Verificación por atributo (aplicada sobre el segmento Vida+Mapfre, el que debería ser representativo)

| Atributo pedido | Resultado |
|---|---|
| ¿Asociada a MAPFRE? | Solo 13 de 68 pólizas "Vida" (19%) |
| ¿Ramo exclusivamente Vida? | No — 91,3% de la cartera es de otros ramos |
| ¿Titular modelado como persona cuando corresponde? | **No, en ningún caso.** El campo es siempre `companyName`. Confirmado en vivo en la ficha de la póliza pol-272 ("Laboratorio Clínico Larrosa", HDI, producto "Vida individual ejecutivo"): el titular aparece etiquetado "Empresa", con un "Contacto responsable" subordinado — no existe ninguna póliza con titular persona física en el modelo actual |
| ¿Tiene producto asociado? | Sí, pero de la lista genérica de 3 nombres inventados por ramo (Cap. 3) — ninguno de los 12 reales de MAPFRE ni de los 2 confirmados de Plife |
| ¿Tiene capital asegurado? | **No** — campo inexistente en `Policy` (`src/domains/policies/types.ts`); verificado también por grep sin resultados en todo `src/` |
| ¿Tiene prima? | Sí (`premium`) |
| ¿Tiene beneficiarios? | **No** — grep de "beneficiario" en todo `src/` no arroja ningún resultado |
| ¿Tiene vigencia? | Sí (`startDate`/`endDate`) |
| ¿Tiene estado? | Sí (12 estados del ciclo de vida) |
| ¿Tiene forma y frecuencia de pago? | **No** — grep sin resultados |
| ¿Tiene coberturas? | **No** — no existe un campo de coberturas; solo hay `product` (texto) y `branchName` (etiqueta) |
| ¿Tiene documentación e historial? | Parcial — sí tiene `documents[]` tipado (8 tipos posibles), pero no hay una bitácora de cambios de estado más allá de `createdAt`/`updatedAt` |

### 5.3 Pólizas que parecen copiadas de otros ramos

No hay copia literal de contenido, pero sí una **identidad estructural completa**: la ficha de "Vida individual ejecutivo" (pol-272) usa exactamente los mismos 20 campos, en el mismo orden y con el mismo patrón "Empresa + Contacto responsable", que una póliza de "Incendio y contenido comercial" o de "Flota comercial". No existe ningún campo diferencial que reconozca que un seguro de vida individual necesita datos que un seguro de incendio no necesita (persona, salud, beneficiarios, capital). Esta es la evidencia más concreta de que, para el sistema, **"Vida" es hoy un ramo administrativo más, no un dominio con reglas propias.**

---

## 6. Trazabilidad funcional

`Necesidad del cliente → Oportunidad → Producto recomendado → Cotización/Propuesta → Póliza → Seguimiento → Evento de actualización/revisión`

| Tramo | Estado | Dónde se corta |
|---|---|---|
| Necesidad del cliente → Oportunidad | ⚠️ Parcial | `detected_need` es una plantilla fija por ramo, no una necesidad capturada de un cliente real |
| Oportunidad → Producto recomendado | ❌ Cortado | `suggested_product` es el nombre del ramo, no un producto (Cap. 4) |
| Producto recomendado → Cotización/Propuesta | ⚠️ Parcial | Existe `Proposal`, pero es una propuesta consultiva B2B genérica (resumen/problema/oferta), sin campo de producto de seguro, capital ni prima (confirmado en la Auditoría 360° previa) |
| Cotización/Propuesta → Póliza | ❌ Cortado | `Policy` no tiene ningún campo que referencie una `Proposal` u `Opportunity` de origen. Las 785 pólizas demo se generan con un algoritmo **independiente** del de oportunidades y leads — no comparten ID de origen |
| Póliza → Seguimiento | ✅ Existe | `nextAction`/`nextActionDate` |
| Seguimiento → Evento de actualización/revisión | ⚠️ Parcial | Hay estados y notas, pero no una entidad "Evento" separada y consultable |

### Clasificación de origen de las 785 pólizas (pedida explícitamente)

- **Póliza originada en el CRM (con lead/oportunidad trazable)**: 1 caso explícito por diseño — la "Historia B" (`opp-historia-b`, vinculada a `HISTORIA_B_LEAD` vía `lead_id`). El resto de las 40 oportunidades abiertas no tiene `lead_id` (es `null`).
- **Póliza de cartera preexistente (heredada)**: sería la interpretación razonable para la gran mayoría de las 785 — pero el sistema **no tiene un campo que lo declare**. No existe un flag `origen: 'cartera_heredada' | 'originada_en_crm'` en `Policy`, ni está previsto en el documento de dominio `PLIFE-GESTION-POLIZAS-V1.md`.
- **Dato sin origen identificable**: en la práctica, las 785 pólizas caen aquí — el modelo no permite distinguir cuáles son cartera heredada y cuáles se originaron en una conversación comercial del CRM.

Esta es una brecha de modelo adicional a las ya identificadas en la Auditoría 360° previa: **el dominio de Pólizas no prevé la distinción "cartera heredada vs. originada en CRM"**, algo explícitamente pedido para no exigir de más a las pólizas mock.

---

## 7. Pantallas e indicadores

Validado en vivo (Playwright, `localhost:3001`, sesión `daniel.odella` / `admin`):

| Pantalla | Hallazgo |
|---|---|
| `/app/hoy` | Muestra "Vista de Dirección". Alertas de renovación destacadas: responsabilidad civil, transporte, hogar, incendio — ninguna de Vida entre las 6 principales |
| `/app/leads` | Interés mezclado en "Vida", "Incendio", "Responsabilidad civil"; todos los ejemplos visibles son empresas |
| `/app/pipeline` | Kanban de **Leads** (no de Oportunidades) por etapa — copy propio: "Avance de cada lead por las etapas comerciales del modelo Lead-first" |
| `/app/oportunidades` | Ruta legacy — ya no está en el menú lateral, pero sigue siendo accesible por URL directa. 40 oportunidades, buscador "por empresa, contacto o próximo paso". Ejemplos visibles en las primeras tarjetas: "RC general de la empresa", "RC directores y gerentes", "Incendio edificio administrado", "Hogar múltiple integral", "Colectivo de accidentes" — ninguna de Vida entre las primeras 5 |
| `/app/polizas` | Confirma 785 / 68 (Vida) / 13 (Vida+Mapfre) — ver Cap. 5.1 |
| `/app/direccion` | ⚠️ **Alerta ejecutiva propia del sistema**: *"30% de la cartera está concentrada en BSE — Alta dependencia de una sola aseguradora: un cambio de condiciones afecta buena parte de la cartera."* Esta alerta no es solo un dato incorrecto — es **lógica de negocio construida sobre el supuesto multi-aseguradora**: el sistema calcula y comunica proactivamente un riesgo de concentración en BSE, algo que no tendría sentido en un negocio mono-aseguradora MAPFRE (donde la pregunta relevante sería otra: concentración por producto o por tipo de cliente dentro de MAPFRE, no por aseguradora) |
| `/app/empresas`, `/app/contactos` | Rutas siguen existiendo en el filesystem pero no están en el menú lateral actual (confirmado en la Auditoría 360° previa) |
| "Clientes" | **No existe una pantalla dedicada a "Clientes"** — no hay ruta `/app/clientes` en el proyecto (verificado por ausencia en el listado completo de rutas) |
| Consola | Se observaron entre 1 y 3 errores de JS en casi todas las pantallas visitadas. No se investigó la causa raíz (fuera del alcance funcional de este documento) — queda como nota para una validación técnica dedicada |

**Determinación pedida**: la interfaz **no representa los distintos productos de Plife**, pero tampoco concentra todo en "un único seguro de vida genérico" — concentra todo en un **universo multi-ramo/multi-aseguradora genérico**, donde Vida es una categoría minoritaria entre ocho, sin ninguna pantalla, filtro, etiqueta o KPI que aísle o priorice el negocio de vida individual MAPFRE.

**Nota de terminología notada al pasar**: `src/domains/ia-engine/prompt-safety.ts` incluye "MAPFRE" en una lista de `INSURANCE_RISK_TERMS` — términos que, si aparecen en una salida del Copiloto, disparan una sugerencia de revisión humana (junto con "prima", "rescate", "elegibilidad médica", "garantizado", etc.). Esto muestra que la capa de compliance del Copiloto **sí anticipa conversaciones sobre MAPFRE** como caso sensible, aunque el modelo de datos no refleje la exclusividad — otra señal de los "dos modelos mentales en tensión" ya identificados en la Auditoría 360° previa.

---

## 8. Motores inteligentes

Los 6 motores implementados (`src/domains/intelligence-engines/engine-definitions.ts`): **Diagnóstico, Mercado, Producto, Comercial, Dirección, Aprendizaje**. Son genéricos de metodología de venta consultiva B2B — ninguno es específico de un producto de seguro. Estado declarado en el propio código: 3 `available_mock` (Diagnóstico, Comercial, Aprendizaje — generan texto plantillado determinístico) y 3 `conceptual` (Mercado, Producto, Dirección — ni siquiera tienen una salida mock, solo descripción). El disclaimer que acompaña toda salida dice explícitamente: *"No genera primas, coberturas ni datos reales de mercado."* Ninguno de los 6 puede ejecutarse sobre la entidad Póliza (`AIExecutionEntityType` no incluye `policy`).

Capacidad por ítem pedido, evaluada para los productos confirmados de Plife (Cap. 2):

| Capacidad | Estado |
|---|---|
| Detectar una oportunidad para ese producto específico | **Inexistente** — no hay lógica de detección por producto, solo por ramo genérico |
| Recomendar ese producto | **Inexistente** |
| Explicar el motivo de la recomendación | **Inexistente** |
| Priorizar el caso | **Simulada** (Motor Dirección está en estado `conceptual`, sin mock siquiera) |
| Detectar documentación faltante | **Implementada** — pero a nivel de póliza genérica (ya existe `/app/polizas/documentacion`), no de producto |
| Detectar cobertura insuficiente | **Inexistente** — no hay campo de capital/cobertura que analizar |
| Sugerir revisión de beneficiarios | **Inexistente** — no existe el campo Beneficiarios en ningún lugar del modelo |
| Detectar riesgo de pago | **Inexistente** — no existe el campo de pago/mora |
| Recomendar seguimiento | **Implementada** — de forma genérica (`nextAction`/`nextActionDate` en todas las entidades), no específica de producto |

---

## 9. Matriz de cobertura funcional

| Producto o servicio de Plife | Confirmado por Plife | Existe en catálogo CRM | Tiene oportunidad mock | Tiene póliza mock | Tiene cliente coherente | Tiene ficha adecuada | Aparece en dashboard | Tiene indicador | Tiene motor inteligente | Trazabilidad completa | Estado | Acción recomendada |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| "Vida entera + ahorro para jubilación" (nombre comercial sin confirmar) | Sí (confirmado, nombre exacto pendiente) | No (solo 3 nombres genéricos de "Vida" que no coinciden) | No (ninguna oportunidad lo nombra; `suggested_product` es el ramo) | Parcial (13 de 785 son Vida+Mapfre, pero sin producto nombrado) | No (titular siempre "Empresa", nunca persona física) | No (ficha genérica idéntica a cualquier otro ramo) | No (no aparece diferenciado en ningún KPI) | No | No | No | **PARCIAL** | Confirmar nombre comercial exacto con Plife → construir catálogo maestro → rediseñar ficha de póliza de vida |
| "Seguro Internacional de Salud" | Sí (confirmado, origen del proveedor sin confirmar) | No (no existe ramo "Salud" en el proyecto) | No | No | No | No | No | No | No | No | **AUSENTE** | Confirmar con Plife si es producto MAPFRE o de un tercero antes de decidir si corresponde modelarlo |
| Los 12 productos individuales del catálogo oficial MAPFRE Uruguay (TC1…AP Senior) | **PENDIENTE DE VALIDAR CON PLIFE** (ninguno confirmado como vendido por Plife) | No (ninguno aparece nombrado) | No | No | No | No | No | No | No | No | **PENDIENTE DE VALIDAR CON PLIFE** | No incorporar al catálogo maestro hasta que Plife confirme cuáles vende efectivamente |
| "Carrera" / reclutamiento de agentes | Sí (confirmado, pero no es un producto asegurador) | N/A — no aplica esta matriz (no es un servicio de cobertura) | Parcial — `OpportunityType` incluye `reclutamiento`, pero el generador demo nunca lo produce (Cap. 4) | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **FUERA DE ALCANCE DE ESTA MATRIZ** | Definir si el reclutamiento de agentes debe vivir en el mismo CRM (pregunta ya planteada en la Auditoría 360° previa) |

---

## 10. Matriz de datos incorrectos

| Archivo / ubicación | Dato actual | Problema | Regla correcta (a validar) | Prioridad | Propuesta de corrección |
|---|---|---|---|---|---|
| `src/lib/demo/pools.ts:198` (`ASEGURADORAS_DEMO`) | 6 aseguradoras (BSE, Porto Seguro, Mapfre, SURA, Zurich, HDI) | Mapfre no es la única aseguradora del universo demo | Si se confirma exclusividad MAPFRE: una sola aseguradora | Alta | Reducir el array a `['Mapfre']` (o al set que Plife confirme) — solo tras validación de negocio |
| `src/lib/demo/pools.ts:201` (`ASEGURADORA_WEIGHTS`) | BSE 30% (líder), Mapfre 18% | Modela deliberadamente a BSE como líder de mercado | N/A si hay una sola aseguradora | Alta | Eliminar junto con el punto anterior |
| `src/lib/demo/pools.ts:205` (`RAMOS_DEMO`) | 8 ramos, Vida incluido entre otros 7 | Vida es minoritario (1/8) | Si se confirma foco en Vida: ramo único o dominante | Alta | Reducir/ajustar según validación de negocio (Cap. 13, Bloque 1) |
| `src/lib/demo/pools.ts:235` (`PRODUCTOS_POR_RAMO['Vida']`) | `['Vida colectiva de socios', 'Vida individual ejecutivo', 'Vida saldo deudor']` | Nombres inventados, no coinciden con ningún producto real de Plife ni de MAPFRE | Catálogo real confirmado por Plife | Alta | Reemplazar por catálogo maestro validado (Cap. 13, Bloque 2) |
| `src/lib/demo/universe.ts:614` (`suggested_product: branch`) | El "producto sugerido" de una oportunidad es el nombre del ramo | Una oportunidad nunca identifica un producto real | `suggested_product` debe referenciar el catálogo maestro | Alta | Vincular a catálogo maestro por FK, no por texto |
| `src/lib/demo/universe.ts:607` (`type: 'b2b'` fijo) | Las 40 oportunidades abiertas generadas son siempre B2B | No hay ningún caso de venta directa a persona individual (B2C) en los datos demo | Si el negocio real incluye B2C: generar oportunidades B2C también | Media | Diversificar el generador para incluir `b2c` |
| `src/domains/policies/types.ts` (interfaz `Policy`) | Campos: `companyName`, `contactName` (strings libres); sin `capital`, sin `beneficiarios`, sin `formaPago`, sin `frecuenciaPago` | Titular modelado como empresa incluso para productos de vida individual; faltan campos centrales de un seguro de vida | Cliente persona física como registro principal; campos exhaustivos (ver Auditoría 360° previa, Cap. 4) | Alta | Rediseño de modelo (Cap. 13, Bloque 4) |
| `src/domains/policies/mock-data.ts` (8 pólizas estáticas) | 1 de 8 es "Vida", aseguradora SURA (no Mapfre) | Ni siquiera el set chico de ejemplo tiene un caso Vida+Mapfre | Al menos un ejemplo representativo del negocio real | Media | Regenerar tras validación de catálogo |
| `src/app/app/direccion/` (lógica de alertas ejecutivas) | Alerta "30% de la cartera concentrada en BSE" | Lógica de negocio basada en el supuesto multi-aseguradora | Alertas relevantes para un negocio mono-aseguradora (ej. concentración por producto) | Alta | Rediseñar las alertas ejecutivas tras validar el encuadre de negocio |
| `src/domains/intelligence-engines/*` | 6 motores genéricos de metodología de venta, ninguno de producto de seguro | No hay motor de recomendación de producto, cobertura o beneficiario | Motores conectados al catálogo maestro y a la ficha de póliza | Media | Ampliar `AIExecutionEntityType` y diseñar motores específicos (Cap. 13, Bloque 6) — posterior a los bloques 1-4 |
| Grep global de `src/` | Sin resultados para "beneficiario", "capital asegurado", "cuestionario de salud", "forma de pago" | Ausencia total de campos centrales de un seguro de vida individual | Deben existir como campos de primera clase | Alta | Diseño de submodelo (Auditoría 360° previa, Cap. 4) |

---

## 11. Brechas detectadas (síntesis)

1. **No existe un catálogo maestro de productos** — ni de Plife ni de MAPFRE. `product` es texto libre elegido al azar por ramo.
2. **Ningún producto confirmado de Plife tiene representación 1:1** en catálogo, oportunidades, pólizas, fichas, dashboard, indicadores ni motores.
3. **El segmento Vida+Mapfre es marginal** en los datos (1,7% de la cartera) pese a ser, presumiblemente, el corazón del negocio.
4. **El titular de la póliza nunca es una persona física** — ni siquiera en productos etiquetados "individual".
5. **Faltan campos estructurales de un seguro de vida**: capital asegurado, beneficiarios, forma/frecuencia de pago, cuestionario de salud.
6. **La trazabilidad Necesidad→Oportunidad→Producto→Póliza está cortada** en al menos dos puntos: Oportunidad→Producto (el "producto sugerido" es el ramo) y Propuesta→Póliza (sin FK).
7. **No hay forma de distinguir pólizas originadas en el CRM de cartera heredada** — el modelo no prevé ese flag.
8. **El dashboard de Dirección contiene lógica de negocio (no solo datos) construida sobre el supuesto multi-aseguradora** (alerta de concentración en BSE).
9. **Los motores inteligentes son genéricos de metodología de venta**, no pueden recomendar, explicar ni priorizar en función de un producto real, y no pueden ejecutarse sobre la entidad Póliza.
10. **El "Seguro Internacional de Salud" no tiene ningún ramo ni producto equivalente** en el proyecto, y su origen (MAPFRE vs. tercero) no está confirmado — riesgo de incumplir la regla de exclusividad si se llegara a modelar sin validar.

---

## 12. Riesgos de continuar sin corregirlas

- **Riesgo de producto**: seguir construyendo pantallas, motores y datos sobre un catálogo inventado retrasa (en vez de acelerar) la llegada a un CRM útil para el negocio real de Plife.
- **Riesgo de credibilidad en demo**: cualquier demo comercial que muestre el dashboard de Dirección hoy comunicaría una alerta de "dependencia de BSE" sin sentido para el negocio real, lo que puede confundir a stakeholders o clientes.
- **Riesgo de cumplimiento**: si el "Seguro Internacional de Salud" resulta ser de un tercero y se refuerza en el mock/CRM sin aclararlo, se reforzaría una práctica que podría incumplir la regla de exclusividad MAPFRE.
- **Riesgo de re-trabajo**: cuanto más se invierta en datos mock y pantallas basadas en el catálogo genérico actual, mayor el costo de migrar después a un catálogo maestro real.
- **Riesgo de motores inteligentes mal fundados**: diseñar motores de recomendación/priorización antes de tener un catálogo y un modelo de póliza reales generaría motores que aprenderían o simularían sobre datos que no representan el negocio.
- **Riesgo de decisiones de Dirección mal informadas**: si esta vista se usa operativamente antes de corregir el modelo, las alertas ejecutivas (concentración de cartera, renovaciones, etc.) estarían midiendo el negocio equivocado.

---

## 13. Cambios recomendados por prioridad — bloques pequeños

> Cada bloque requiere aprobación funcional antes de avanzar al siguiente. Ningún bloque implica escribir código en esta etapa.

**Bloque 1 — Regla global del negocio**
- Confirmar con Plife si corresponde: aseguradora única MAPFRE, ramo único (o dominante) Vida.
- Si se confirma: eliminación planificada de otras aseguradoras y ramos del universo demo (`pools.ts`).
- *Prerrequisito de todos los bloques siguientes.*

**Bloque 2 — Catálogo maestro confirmado**
- Productos reales de Plife (los 2 del Cap. 2, con nombre comercial exacto validado) + los que Plife confirme del catálogo MAPFRE Uruguay.
- IDs internos, nombres consistentes, categorías (producto vs. cobertura vs. beneficio, respetando la distinción de este documento).

**Bloque 3 — Datos mock**
- Regenerar clientes, oportunidades, pólizas, beneficiarios (cuando exista el campo), eventos y documentos alineados al catálogo del Bloque 2.

**Bloque 4 — Modelo funcional**
- Relación Necesidad → Producto → Oportunidad → Póliza (con FK real, no texto libre).
- Flag de cartera heredada vs. originada en CRM.
- Titular persona física como registro principal cuando corresponda.
- Beneficiarios, coberturas, capital asegurado, forma/frecuencia de pago.

**Bloque 5 — UX**
- Listados, fichas, filtros, dashboard, PLIFE Hoy, Dirección y guion de demo alineados al negocio validado (incluye rediseñar la lógica de alertas ejecutivas de Dirección).

**Bloque 6 — Motores inteligentes**
- Recomendación de producto, priorización, calidad de datos, revisión de cobertura y beneficiarios, seguimiento — todos conectados al catálogo maestro y al modelo de póliza de los Bloques 2 y 4, nunca antes.

---

## 14. Archivos probablemente afectados (sin modificarlos)

**Datos y generación demo**
- `src/lib/demo/pools.ts` — aseguradoras, ramos, productos por ramo, pesos de mercado
- `src/lib/demo/universe.ts` — generación de las 785 pólizas, 40+75 oportunidades, 30 leads, alertas de Dirección
- `src/lib/demo/prng.ts` — generador determinístico usado por `universe.ts`

**Modelo y mocks de dominio**
- `src/domains/policies/types.ts`, `src/domains/policies/mock-data.ts`, `src/domains/policies/filters.ts`
- `src/domains/leads/types.ts`, `src/domains/leads/mock-data.ts`, `src/domains/leads/scoring.ts`, `src/domains/leads/qualification.ts`
- `src/domains/opportunities/actions.ts`
- `src/domains/proposals/types.ts`, `src/domains/proposals/mock-generator.ts`
- `src/domains/insurers/`, `src/domains/insurance-branches/`
- `src/types/database.ts`

**Motores inteligentes**
- `src/domains/intelligence-engines/engine-definitions.ts`, `mock-output.ts`, `types.ts`
- `src/domains/ia-engine/mock-runner.ts`, `prompt-safety.ts`

**UI**
- `src/app/app/polizas/` (todas las subrutas)
- `src/app/app/oportunidades/`, `src/app/app/pipeline/`
- `src/app/app/direccion/` (lógica de alertas ejecutivas)
- `src/app/app/hoy/`
- `src/components/layout/app-sidebar.tsx`

**Documentación**
- `docs/product/PLIFE-GESTION-POLIZAS-V1.md`
- `docs/product/screen-map.md`, `role-matrix.md`

---

## 15. Dudas que requieren validación con Plife

1. Nombre comercial exacto del producto "vida entera + ahorro para jubilación" publicado en `plifeuruguay.com` — ¿corresponde a PLUS, VIP, Ahorro Seguro, o a una combinación/versión propia?
2. ¿El "Seguro Internacional de Salud" es un producto de MAPFRE o de un tercero? Si es de un tercero, ¿se sigue comercializando y cómo convive con la regla de exclusividad MAPFRE?
3. ¿Cuáles de los 12 productos del catálogo oficial de MAPFRE Uruguay vende Plife efectivamente hoy?
4. ¿El negocio de Plife es exclusivamente individual (personas), o también vende pólizas colectivas/corporativas de MAPFRE?
5. ¿Existen pólizas de cartera heredada de otras aseguradoras (no MAPFRE) que deban convivir en el sistema como "legado", o el sistema debe asumir 100% MAPFRE desde el primer registro?
6. ¿Cómo debería representarse el negocio de reclutamiento de agentes ("Carrera") en relación al CRM de venta a clientes — mismo sistema, módulo separado, o fuera de alcance?
7. ¿Qué información mínima maneja hoy Plife para dar de alta un cliente persona física (más allá de lo que ya se preguntó en la Auditoría 360° previa: cédula, fecha de nacimiento, salud, beneficiarios)?
8. ¿Existe hoy, operativamente, algún proceso de seguimiento de pago de primas fuera del sistema (ej. directamente con MAPFRE) que el CRM debería reflejar aunque no lo procese?

---

## 16. Propuesta de secuencia de implementación

1. Validar Bloque 1 (regla global de negocio) con Plife — sin esto, cualquier trabajo en los Bloques 2-6 corre el riesgo de reforzar un catálogo equivocado.
2. Construir Bloque 2 (catálogo maestro) usando exclusivamente lo confirmado en el Capítulo 2 de este documento, más lo que Plife valide del catálogo MAPFRE.
3. Ejecutar Bloque 3 (datos mock) y Bloque 4 (modelo funcional) en paralelo, dado que están acoplados (los datos mock dependen de los campos que defina el modelo).
4. Ejecutar Bloque 5 (UX) una vez estabilizados los Bloques 2-4, priorizando la ficha de póliza y el dashboard de Dirección (por ser los que hoy comunican activamente el modelo de negocio equivocado).
5. Ejecutar Bloque 6 (motores inteligentes) al final, conectado al catálogo y modelo ya validados — nunca antes, para no simular recomendaciones sobre datos que no representan el negocio.

No se implementó ninguna mejora en este documento — es exclusivamente diagnóstico, para aprobar decisiones funcionales antes de iniciar cambios.
