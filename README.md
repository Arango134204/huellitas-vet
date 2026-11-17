# HuellitasVet

Sistema web para la gestión de una clínica veterinaria (Pereira). Proyecto final de **Desarrollo Web II** (parte web del proyecto integrador Móvil I + Web 2).

**Autor:** Juan José Arango  
**Repositorio:** https://github.com/Arango134204/huellitas-vet

## Estructura del repositorio

| Carpeta | Contenido |
|---------|-----------|
| `Backend/` | API REST con Node.js, Express, Mongoose y MongoDB (**B mayúscula**) |
| `web-angular/` | Panel de administración en Angular 19 |
| `documentacion/` | SRS, manual, matriz de pruebas, Postman e instrucciones |
| `android/` | Placeholder: la app móvil corresponde a Móvil I |

> En Windows `backend` y `Backend` suelen ser la misma carpeta; en Linux/macOS el nombre es **sensible a mayúsculas**. Use siempre `cd Backend`.

## Stack

- Node.js 20+ / Express 5 / Mongoose 9 / MongoDB local
- Multer (imágenes: extensión + MIME + magic bytes, máx. 2 MB)
- Angular 19 (rutas, servicios HTTP, formularios reactivos)
- dotenv, cors, validator

## Entidades

1. **Dueño** (apoyo) — CRUD + desactivación  
2. **Mascota** (apoyo) — CRUD + edición + imagen + historial + desactivación  
3. **Cita** (operación central) — crear, editar (si pendiente), estados `pendiente → atendida | cancelada`

## Ejecución

### 1. API

```bash
cd Backend
copy .env.example .env
npm install
npm start
```

Servidor: http://localhost:3900  

### 2. Carga inicial de la base (opcional)

```bash
cd Backend
npm run seed
```

**ADVERTENCIA:** `npm run seed` **borra** todos los documentos de `duenos`, `mascotas` y `citas` y vuelve a insertar la carga inicial de la clínica. No lo ejecute si ya registró datos que quiera conservar.

### 3. Panel Angular

```bash
cd web-angular
npm install
npm start
```

Panel: http://localhost:4200  
URL de la API: `web-angular/src/environments/environment.ts`.

### 4. Postman

Importar `documentacion/HuellitasVet.postman_collection.json`.  
Variables: `baseUrl`, `duenoId`, `mascotaId`, `citaId`.  
Incluye scripts de prueba (`pm.test`) para códigos HTTP esperados.

## Variables de entorno

`Backend/.env.example` (no subir `.env` real):

```
PORT=3900
MONGODB_URI=mongodb://127.0.0.1:27017/huellitas-vet
```

## Reglas de negocio (servidor)

1. No agendar ni editar citas hacia el pasado.  
2. No solapar citas del mismo veterinario (±30 min) — también al **editar**.  
3. Cupo máximo de 8 citas/día por veterinario — también al **editar**.  
4. Transiciones: solo `pendiente → atendida` o `pendiente → cancelada`.  
5. No eliminar dueño con mascotas (activas o inactivas); no eliminar mascota con historial de citas; no eliminar cita atendida.  
6. Candado por veterinario/día para reducir condiciones de carrera en el mismo proceso Node.

## Documentación

- `documentacion/Documento_Entrega_Final_HuellitasVet.docx` — SRS  
- `documentacion/Correcciones_Feedback_Docente.docx` — arreglos tras la revisión  
- `documentacion/INSTRUCCIONES_PARA_CORRER.txt`  
- `documentacion/Explicacion_del_Codigo_HuellitasVet.docx`  
- `documentacion/Matriz_de_Pruebas_HuellitasVet.docx`  
- `documentacion/HuellitasVet.postman_collection.json`
