# Gestión de Pólizas — Artefacto de Dominio (V1 congelada)

| Campo | Valor |
|---|---|
| Artefacto | Gestión de Pólizas |
| Versión | 1.0 |
| Estado | Congelado |
| Tipo | Artefacto de Dominio |
| Sector | Seguros |
| Proyecto origen | Plife Uruguay |
| Proyectos de referencia | FCG, consulta read-only |
| Implementaciones actuales | Plife Uruguay, en desarrollo |
| Implementaciones futuras | Por definir |
| Última revisión | 2026-07-24 |
| Próxima revisión prevista | Al iniciar V2 |
| Dependencias | Ninguna |
| Artefactos relacionados | Discovery, pendiente |
| Responsable | Daniel Odella / Summer87 |
| Repositorio | `https://github.com/Summer87Intelligence/Plife-Uruguay.git` |
| Rama | `feat/lead-first-crm` |
| Commit base previo a esta actualización | `ef7be27a576142ee13f60783b924e0bb18066ca5` |
| Estado de aprobación | Validado por responsable del proyecto |
| Hash SHA-256 | No verificado dentro del propio documento (se calcula externamente después de guardar, para no volver autorreferencial el cálculo) |

---

## 1. Propósito

Una corredora de seguros B2B necesita saber, en cualquier momento, qué pólizas gestiona en nombre de sus clientes, cuáles están vigentes, cuáles requieren acción y quién es responsable de cada una. Este artefacto define el dominio de **Gestión de Pólizas**: el conjunto de entidades, estados, procesos y reglas de negocio que cualquier sistema de una corredora necesita para operar ese seguimiento — independientemente de la tecnología o el proyecto que lo implemente.

El sistema que implemente este dominio **nunca reemplaza a la aseguradora** como fuente de verdad de las condiciones contractuales de una póliza (primas, coberturas, vigencias). Su función es dar visibilidad y trazabilidad comercial, no emitir ni calcular pólizas.

## 2. Alcance

Este documento describe el dominio de negocio de la Gestión de Pólizas para una corredora de seguros, con la intención explícita de que sea utilizable como referencia por:

- Plife (primera implementación real de este dominio),
- FCG (proyecto hermano del sector seguros),
- futuros proyectos del sector,
- y, eventualmente, como artefacto compartido de Summer87 OS — solo una vez validado con una implementación real (ver §15).

El dominio cubre el ciclo de vida completo de una póliza, desde su origen comercial hasta su resolución (renovada, no renovada o cancelada). No describe la implementación de ningún proyecto puntual, ni su interfaz, ni su base de datos.

Flujo de negocio que enmarca el dominio: una oportunidad comercial se convierte en cliente; un cliente puede ser una empresa o una persona; el cliente contrata un producto de una compañía aseguradora; esa relación se materializa en una o más pólizas.

## 3. Definiciones

- **Cliente**: persona o empresa que contrata una póliza (el asegurado).
- **Aseguradora**: compañía proveedora del servicio de seguro (ej. BSE, Porto Seguro, Mapfre, SURA).
- **Producto**: oferta comercial concreta de una aseguradora.
- **Ramo**: categoría general de riesgo cubierto (ej. Vehículos, Vida, Incendio, Responsabilidad civil).
- **Póliza**: contrato formalizado entre un cliente y una aseguradora. Nace exclusivamente cuando la aseguradora emite — nunca antes.
- **Vigencia**: período durante el cual una póliza está activa.
- **Renovación**: proceso de continuidad de una póliza al finalizar su vigencia.
- **Prima**: monto que el cliente paga por la cobertura.
- **Comisión**: monto o porcentaje que percibe la corredora por la intermediación.
- **Endoso**: modificación formal de una póliza vigente (concepto del dominio; fuera de alcance operativo en V1, ver §13).
- **Siniestro**: reclamo de cobertura sobre una póliza vigente (concepto del dominio; fuera de alcance en V1, ver §13).
- **Ejecutivo responsable**: persona de la corredora a cargo del seguimiento comercial de la póliza.

## 4. Entidades

- Cliente (Empresa o Persona)
- Aseguradora
- Producto
- Ramo
- Póliza
- Documento
- Ejecutivo responsable
- Endoso (existe en el dominio; no operativo en V1)
- Siniestro (existe en el dominio; no operativo en V1)

## 5. Relaciones

- Un Cliente puede tener múltiples Pólizas.
- Una Póliza pertenece a un único Cliente y a una única Aseguradora.
- Una Póliza tiene un Producto, y un Producto pertenece a un Ramo.
- Una Póliza tiene un único Ejecutivo responsable en un momento dado.
- Una Póliza puede tener múltiples Documentos asociados.
- Una Póliza puede tener múltiples Endosos a lo largo de su vigencia (concepto del dominio; no operativo en V1).
- Una Póliza puede tener cero o más Siniestros mientras está vigente (concepto del dominio; no operativo en V1).
- Un **cambio de compañía aseguradora** no es una relación ni un estado nuevo: se modela como la cancelación de una póliza existente más el alta de una póliza nueva con otra aseguradora, para el mismo cliente y un producto equivalente.

## 6. Estados

Ciclo de vida completo de una póliza:

`borrador → cotización → pendiente de documentación → enviada a aseguradora → emitida → vigente → próxima a vencer → en renovación → { renovada | no renovada | cancelada | rechazada }`

Reglas de transición relevantes al dominio:

- Una póliza nace en el estado `emitida` únicamente cuando la aseguradora efectivamente emite. Nunca antes (no en una venta comercial cerrada) ni después (no existe un estado intermedio de "casi emitida").
- `cancelada` se alcanza únicamente por una acción manual explícita de un usuario autorizado — nunca automáticamente por vencimiento. Requiere registrar motivo, fecha efectiva, usuario responsable y una observación opcional.
- `no_renovada` es un resultado final del proceso de renovación, no un vacío: conserva el historial completo de la póliza (no se elimina) y requiere registrar motivo, fecha, usuario responsable, observaciones y la próxima acción comercial sobre ese cliente.
- `rechazada` es el desenlace posible si la aseguradora no emite tras `enviada a aseguradora`.

## 7. Procesos

1. Alta de póliza.
2. Emisión (confirmación de la aseguradora).
3. Seguimiento documental.
4. Inicio de vigencia.
5. Detección de proximidad de vencimiento (regla de transición hacia "próxima a vencer").
6. Renovación.
7. Cancelación.
8. Endoso (concepto del dominio; no operativo en V1).
9. Asociación de la póliza con el cliente responsable.
10. Consulta histórica de pólizas de un cliente.

## 8. Documentos

Una póliza puede tener asociados documentos de los siguientes tipos: póliza emitida, certificado, propuesta o cotización, condiciones particulares, condiciones generales, comprobante, endoso, otros.

Cada documento registra como mínimo: tipo, nombre, fecha de incorporación, quién lo incorporó, y su vigencia si corresponde.

## 9. Eventos de negocio

- Alta de póliza (nace tras la emisión de la aseguradora).
- Emisión confirmada.
- Inicio de vigencia.
- Entrada en ventana de renovación.
- Renovación confirmada.
- Renovación no concretada.
- Cancelación.
- Cambio de compañía aseguradora (se expresa como cancelación + alta nueva, ver §5).
- Registro de endoso (concepto del dominio; no operativo en V1).
- Apertura y cierre de siniestro (concepto del dominio; no operativo en V1).

## 10. Roles

- **Asesor comercial**: gestiona el día a día de las pólizas de su cartera asignada.
- **Líder/gerente comercial**: supervisa las pólizas de su equipo.
- **Dirección**: acceso agregado a la cartera para decisiones de negocio.
- **Administración**: mantiene los catálogos del dominio (aseguradoras, ramos) y la documentación.
- **Cliente**: actor externo, asegurado — no es un rol operativo dentro del sistema en V1.
- **Aseguradora**: actor externo, proveedor del servicio — no es un rol operativo dentro del sistema en V1.

## 11. Información mínima obligatoria

Para que una póliza pueda operar dentro de este dominio, debe existir como mínimo:

- Cliente al que pertenece.
- Aseguradora asociada.
- Producto y ramo.
- Estado actual.
- Ejecutivo responsable.

Adicionalmente, para considerarse operativa más allá del borrador inicial:

- Vigencia (inicio y vencimiento).
- Prima.
- Trazabilidad de quién registró y quién actualizó la información por última vez.

La comisión es información obligatoria a nivel de modelo, pero de visibilidad restringida (ver §12) — no es requisito para que la póliza opere, sí para el seguimiento comercial completo.

## 12. Restricciones

- El sistema que implemente este dominio **nunca es fuente de verdad de primas ni coberturas** — esa autoridad es siempre de la aseguradora.
- Ninguna póliza se elimina físicamente. Toda baja es lógica y conserva su historial completo.
- `cancelada` y `no_renovada` son siempre resultado de una acción o un proceso de negocio explícito, nunca de un borrado ni de un vacío sin registro.
- Un cambio de compañía aseguradora no introduce un estado nuevo: se resuelve como cancelación de una póliza más alta de otra.
- La comisión es información sensible: su visibilidad se restringe por rol y nunca se expone a clientes ni aseguradoras.
- Un documento se asocia siempre a una póliza existente; no existen documentos huérfanos dentro del dominio.

## 13. Fuera del alcance V1

Quedan explícitamente fuera de esta versión, como referencia para versiones futuras:

- Motores inteligentes / IA (recomendaciones, scoring, probabilidad de renovación).
- Dashboards y KPIs agregados.
- Automatizaciones y predicciones.
- Integraciones API con aseguradoras.
- Siniestros como proceso operativo.
- Liquidación de comisiones.
- Portal de autoconsulta del cliente.
- Portal de aseguradoras.
- Endosos como proceso operativo completo.
- Analytics y reportes.
- Catálogo formal jerárquico aseguradora → producto → coberturas.
- Base de cálculo detallada de comisión (prima neta, prima total u otra).
- Cualquier extracción hacia un artefacto compartido de Summer87 OS.

Ninguno de estos puntos se desarrolla en esta versión; solo queda constancia de que pertenecen a etapas posteriores.

## 14. Preguntas pendientes

1. ¿Cómo se modela exactamente un asegurado que es una persona física sin empresa asociada, cuando ese caso aparezca?
2. ¿Cuál es la base de cálculo de la comisión (prima neta, prima total u otra)? Requiere validación comercial.
3. ¿La transición a `no_renovada` es siempre una acción manual, como `cancelada`, o puede resultar de un vencimiento de plazo sin gestión?
4. ¿Qué rol administra los catálogos de Aseguradoras y Ramos — solo Administración, o también Dirección?
5. ¿En qué momento conviene evaluar una jerarquía formal aseguradora → producto → ramo, en lugar de mantenerlos independientes?

## 15. Criterios para pasar a V2

- V1 debe estar implementado y en uso real en Plife, con al menos un ciclo completo observado (alta → vigente → renovación o cancelación).
- Las preguntas pendientes de §14 deben quedar resueltas con validación comercial real, no con supuestos de diseño.
- No corresponde incorporar ningún punto de §13 (motores, dashboards, integraciones, siniestros, etc.) sin evidencia de uso real de V1 que lo justifique.
- La extracción de cualquier pieza de este dominio hacia un artefacto compartido de Summer87 OS solo se evalúa después de tener a Plife operando V1 como referencia real, y de compararlo contra una segunda implementación real (no solo conceptual) — nunca antes.
- Cualquier incorporación futura de un motor inteligente debe preservar la restricción de §12: el sistema nunca es fuente de verdad de primas ni coberturas.
