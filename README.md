# HuellitasVet

Sistema web para la gestión de una clínica veterinaria (Pereira). Proyecto final de **Desarrollo Web II** (parte web del proyecto integrador Móvil I + Web 2).

**Autor:** Juan José Arango

## Qué incluye (parte web)

| Carpeta | Contenido |
|---------|-----------|
| `/backend` | API REST con Node.js, Express, Mongoose y MongoDB |
| `/web-angular` | Panel de administración en Angular 19 |
| `/documentacion` | Documentación técnica, manual, matriz de pruebas y colección Postman |
| `/android` | Placeholder: la app móvil corresponde a Móvil I |

## Stack

- Node.js 24 + Express 5 + Mongoose 9 + MongoDB local
- Multer (carga de fotos de mascotas, máx. 2 MB)
- Angular 19 (rutas, servicios HTTP, formularios reactivos)
- dotenv, cors, validator

## Entidades

1. **Dueño** (apoyo) — CRUD + desactivación  
2. **Mascota** (apoyo) — CRUD + imagen + historial de citas  
3. **Cita** (operación central) — estados `pendiente → atendida | cancelada`

## Requisitos

- Node.js 20+
- MongoDB en `mongodb://127.0.0.1:27017`
- Angular CLI (opcional; se usa `npx ng`)

## Ejecución

### 1. API

```bash
cd backend
copy .env.example .env
npm install
npm run seed
npm start
```

Servidor: http://localhost:3900  
Verificación: `GET /` → `{"message":"Servidor OK",...}`

### 2. Panel Angular

```bash
cd web-angular
npm install
npm start
```

Panel: http://localhost:4200  
La URL de la API está en `web-angular/src/environments/environment.ts`.

### 3. Postman

Importar `documentacion/HuellitasVet.postman_collection.json`.  
Variables: `baseUrl`, `duenoId`, `mascotaId`, `citaId`.

## Variables de entorno

Ver `backend/.env.example` (no subir `.env` real):

```
PORT=3900
MONGODB_URI=mongodb://127.0.0.1:27017/huellitas-vet
```

## Reglas de negocio (servidor)

1. No agendar citas en el pasado.  
2. No solapar citas del mismo veterinario (±30 min).  
3. Cupo máximo de 8 citas/día por veterinario.  
4. Transiciones de estado: solo `pendiente → atendida` o `pendiente → cancelada`.  
5. No eliminar un dueño con mascotas activas; no eliminar mascota con citas pendientes; no eliminar cita atendida.

## Demostración sugerida

1. Abrir Angular → Inicio (resumen y citas de hoy).  
2. Registrar dueño y mascota.  
3. Subir foto en el detalle de la mascota.  
4. Agendar cita y marcarla como atendida.  
5. En Postman: intentar cita en el pasado y transición inválida (deben fallar).

## Documentación

- `documentacion/Documentacion_Tecnica_HuellitasVet.docx`
- `documentacion/Manual_Usuario_HuellitasVet.docx`
- `documentacion/Matriz_de_Pruebas_HuellitasVet.docx`
- `documentacion/HuellitasVet.postman_collection.json`
