# Registro de validación del cliente / demostración

**Proyecto:** HuellitasVet  
**Asignatura:** Desarrollo Web II (parte web del proyecto integrador)  
**Estudiante:** Juan José Arango  
**Fecha:** 17 de noviembre de 2026  

## Participante

| Campo | Valor |
|-------|-------|
| Rol | Cliente ficticio / demostración académica (clínica veterinaria) |
| Nombre | — (piloto con datos de prueba; sin datos reales de pacientes) |
| Medio | Red local (API :3900, Angular :4200) |

## Tareas probadas

1. Consultar resumen y citas del día en el panel Angular.  
2. Registrar un dueño y una mascota.  
3. Subir fotografía de la mascota (Multer) y visualizarla.  
4. Agendar una cita y cambiar su estado a atendida / cancelada.  
5. Verificar en Postman las reglas: cita en el pasado, transición inválida, borrado de dueño con mascotas.

## Comentarios

El flujo administrativo web queda funcional para el piloto. La aplicación Android se valida en la entrega de Móvil I contra la misma API (`origen: movil`).

## Limitaciones informadas

- Sin autenticación JWT en este piloto (datos ficticios).  
- Sin despliegue en la nube; ejecución reproducible en local.  
- No se utilizan datos personales reales del cliente.

## Ajustes realizados tras la prueba

- Mensajes de error visibles en el panel.  
- Confirmación antes de eliminar.  
- Bloqueo de doble envío en formularios.
