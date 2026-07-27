# Plife Uruguay — Estado del proyecto

## Bloque 1 — Alineación MAPFRE Vida y saneamiento del mockup

**Estado:** Cerrado — 2026-07-27

### Resumen

Plife Uruguay comercializa exclusivamente productos de vida de MAPFRE. Una auditoría previa detectó que el mockup del sistema representaba, en cambio, una correduría con múltiples aseguradoras y múltiples ramos de seguro. El Bloque 1 corrigió esa base para que todo lo que muestra el sistema sea consistente con el negocio real de Plife.

### Funcionalidades implementadas

- Regla de negocio única y centralizada: una sola aseguradora (Mapfre) y un solo ramo (Vida) en todo el sistema.
- Cartera de pólizas de ejemplo reconstruida: pasa a representar personas aseguradas individuales (antes representaba empresas), con una cantidad reducida y manejable de casos.
- Cada póliza indica ahora si viene de cartera ya existente o si se originó a través del sistema, y si sus datos están completos.
- El panel de Dirección dejó de mostrar comparaciones entre aseguradoras (ya no corresponden) y pasó a mostrar indicadores relevantes para el negocio real: estado de las pólizas, origen de la cartera y calidad de los datos.
- Los filtros y formularios que antes permitían elegir entre distintas aseguradoras o ramos se simplificaron, ya que solo existe una opción válida.
- Leads y oportunidades comerciales dejaron de mostrar intereses en ramos que Plife no comercializa.

### Validaciones realizadas

- Verificación de tipos y de compilación del proyecto: sin errores.
- Suite de pruebas automáticas: aprobada (con una excepción preexistente, no relacionada a este bloque).
- Revisión visual del sistema en funcionamiento (pólizas, Dirección, panel diario, oportunidades, leads, recorrido de demo): consistente con la regla de negocio en todas las pantallas revisadas.

### Pendientes diferidos al Bloque 2

- Restringir la posibilidad de dar de alta manualmente otra aseguradora u otro ramo desde la pantalla de administración.
- Corregir una prueba automática preexistente relacionada con la navegación del recorrido de demo (no vinculada a este bloque).

---

*Próxima etapa: Bloque 2 — Catálogo maestro de productos (no iniciado).*
