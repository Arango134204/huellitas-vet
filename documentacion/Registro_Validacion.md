# Registro de validación — HuellitasVet (Web 2)

**Proyecto:** HuellitasVet  
**Asignatura:** Desarrollo Web II (parte web del proyecto integrador)  
**Estudiante:** Juan José Arango  
**Fecha de la prueba observada:** 17 de noviembre de 2026  

## Justificación del tipo de cliente

HuellitasVet se planteó como **clínica veterinaria de demostración académica** (Pereira), no como un negocio con contrato comercial previo. Por esa razón:

1. **No existe un cliente externo real** con NIT, representante legal o datos clínicos de pacientes humanos/animales reales que autorice el tratamiento de información sensible.
2. Usar datos personales o clínicos reales sin acuerdo previo incumple las condiciones del propio lineamiento docente (“trabajar inicialmente con información ficticia” / piloto controlado).
3. La validación se realiza por tanto con **datos operativos de la clínica del sistema** (carga inicial en MongoDB) y una **prueba integral observada** en el entorno local reproducible.

## Participante de la validación

| Campo | Valor |
|-------|-------|
| Tipo | Piloto académico / cliente ficticio institucional |
| Nombre del rol | Administrativo de clínica veterinaria (simulacro) |
| Ejecutor | Juan José Arango |
| Observación docente | Prueba demostrada ante el docente en la sesión de entrega / sustentación (entorno local API :3900 + Angular :4200) |
| Medio | Red local (sin despliegue productivo) |

## Tareas probadas (flujo integral)

1. Consultar resumen y citas del día en Angular.  
2. Registrar / editar dueño y mascota.  
3. Subir fotografía (Multer: extensión, MIME y contenido).  
4. Agendar cita y **editar** una cita pendiente (fecha/veterinario) respetando reglas.  
5. Cambiar estado a atendida / cancelada.  
6. En Postman: cita en el pasado (400), transición inválida (409), borrado de dueño con mascotas (409), borrado de mascota con historial (409), PUT de cita a horario ocupado (409).

## Resultado

El flujo administrativo web queda funcional para el piloto. La aplicación Android se valida en Móvil I contra la misma API (`origen: movil`).

## Limitaciones informadas al docente

- Sin autenticación JWT en este piloto.  
- Sin datos personales reales de pacientes.  
- Ejecución en red local; `npm run seed` regenera la carga inicial y **borra** colecciones.

## Ajustes posteriores al feedback docente

Ver `documentacion/Correcciones_Feedback_Docente.docx` (reglas en update, integridad referencial, edición en Angular, Multer por contenido, candado de agenda, documentación y Postman).
