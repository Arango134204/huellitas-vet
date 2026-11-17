'use strict'

/**
 * Carga inicial de la clínica HuellitasVet (Pereira).
 * Uso: npm run seed
 *
 * ADVERTENCIA: elimina TODOS los documentos de duenos, mascotas y citas
 * antes de insertar la carga inicial. No ejecutar si hay datos que conservar.
 */

require('dotenv').config();

const mongoose = require('mongoose');
const Dueno = require('./models/dueno');
const Mascota = require('./models/mascota');
const Cita = require('./models/cita');

function diaDesdeHoy(dias, hora, minutos) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    fecha.setHours(hora, minutos || 0, 0, 0);
    return fecha;
}

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);

    await Promise.all([Dueno.deleteMany({}), Mascota.deleteMany({}), Cita.deleteMany({})]);

    const duenos = await Dueno.create([
        {
            nombre: 'María Fernanda Quintero',
            documento: '1088245678',
            telefono: '3104587123',
            email: 'maria.quintero@gmail.com',
            direccion: 'Cra 8 # 22-15, Centro, Pereira'
        },
        {
            nombre: 'Carlos Andrés Valencia',
            documento: '1088567890',
            telefono: '3156789012',
            email: 'cvalencia.rios@hotmail.com',
            direccion: 'Calle 14 # 8-40, Cuba, Pereira'
        },
        {
            nombre: 'Diana Carolina Mejía',
            documento: '42156789',
            telefono: '3001122556',
            email: 'diana.mejia@outlook.com',
            direccion: 'Av. 30 de Agosto # 45-12, Pereira'
        },
        {
            nombre: 'Julián Esteban Cardona',
            documento: '1088987654',
            telefono: '3124455667',
            email: 'julian.cardona@gmail.com',
            direccion: 'Cra 15 # 7-28, Dosquebradas'
        },
        {
            nombre: 'Laura Sofía Restrepo',
            documento: '1088112233',
            telefono: '3187766554',
            email: 'laura.restrepo@yahoo.com',
            direccion: 'Calle 50 # 26-10, El Poblado, Pereira'
        },
        {
            nombre: 'Andrés Felipe Gómez',
            documento: '79901234',
            telefono: '3019988776',
            email: 'af.gomez@correo.com',
            direccion: 'Cra 12 # 19-05, Consotá, Pereira'
        },
        {
            nombre: 'Patricia Elena Sánchez',
            documento: '42033445',
            telefono: '3142233445',
            email: 'patricia.sanchez@gmail.com',
            direccion: 'Calle 9 # 14-20, Dosquebradas'
        },
        {
            nombre: 'Sebastián López Arias',
            documento: '1088678901',
            telefono: '3205566778',
            email: 'sebastian.lopez@hotmail.com',
            direccion: 'Cra 6 # 11-33, Centro, Pereira'
        }
    ]);

    const [maria, carlos, diana, julian, laura, andres, patricia, sebastian] = duenos;

    const mascotas = await Mascota.create([
        { nombre: 'Max', especie: 'perro', raza: 'Labrador Retriever', fechaNacimiento: '2019-03-12', peso: 32.5, dueno: maria._id },
        { nombre: 'Luna', especie: 'gato', raza: 'Doméstico pelo corto', fechaNacimiento: '2021-07-22', peso: 4.1, dueno: maria._id },
        { nombre: 'Rocky', especie: 'perro', raza: 'Pastor alemán', fechaNacimiento: '2018-11-05', peso: 35.0, dueno: carlos._id },
        { nombre: 'Mila', especie: 'gato', raza: 'Persa', fechaNacimiento: '2022-01-18', peso: 3.8, dueno: diana._id },
        { nombre: 'Toby', especie: 'perro', raza: 'Criollo', fechaNacimiento: '2020-06-30', peso: 14.2, dueno: julian._id },
        { nombre: 'Coco', especie: 'ave', raza: 'Periquito australiano', fechaNacimiento: '2023-09-01', peso: 0.35, dueno: laura._id },
        { nombre: 'Nala', especie: 'gato', raza: 'Siamés', fechaNacimiento: '2020-02-14', peso: 4.6, dueno: andres._id },
        { nombre: 'Bruno', especie: 'perro', raza: 'Golden Retriever', fechaNacimiento: '2017-08-09', peso: 30.0, dueno: patricia._id },
        { nombre: 'Kiara', especie: 'perro', raza: 'Beagle', fechaNacimiento: '2021-12-03', peso: 11.5, dueno: sebastian._id },
        { nombre: 'Pelusa', especie: 'roedor', raza: 'Hámster sirio', fechaNacimiento: '2024-04-10', peso: 0.12, dueno: laura._id },
        { nombre: 'Simba', especie: 'gato', raza: 'Maine Coon', fechaNacimiento: '2019-10-25', peso: 6.8, dueno: diana._id },
        { nombre: 'Canela', especie: 'perro', raza: 'Poodle', fechaNacimiento: '2022-05-17', peso: 7.3, dueno: julian._id }
    ]);

    const [max, luna, rocky, mila, toby, coco, nala, bruno, kiara, pelusa, simba, canela] = mascotas;

    await Cita.create([
        // Historial reciente (atendidas / canceladas)
        {
            mascota: max._id,
            fecha: diaDesdeHoy(-10, 9, 0),
            motivo: 'Vacuna antirrábica anual',
            veterinario: 'Dra. Salazar',
            estado: 'atendida',
            observaciones: 'Aplicación sin complicaciones. Próxima dosis en 12 meses.',
            origen: 'web'
        },
        {
            mascota: luna._id,
            fecha: diaDesdeHoy(-8, 11, 30),
            motivo: 'Desparasitación interna',
            veterinario: 'Dr. Mejía',
            estado: 'atendida',
            observaciones: 'Se indica repetición en 15 días.',
            origen: 'web'
        },
        {
            mascota: rocky._id,
            fecha: diaDesdeHoy(-5, 15, 0),
            motivo: 'Consulta por cojera en pata trasera',
            veterinario: 'Dra. Restrepo',
            estado: 'atendida',
            observaciones: 'Sospecha de esguince leve. Reposo 7 días.',
            origen: 'movil'
        },
        {
            mascota: bruno._id,
            fecha: diaDesdeHoy(-3, 10, 0),
            motivo: 'Control geriátrico',
            veterinario: 'Dra. Salazar',
            estado: 'atendida',
            observaciones: 'Perfil hepático dentro de rangos. Continuar dieta renal.',
            origen: 'web'
        },
        {
            mascota: pelusa._id,
            fecha: diaDesdeHoy(-2, 16, 0),
            motivo: 'Revisión de piel',
            veterinario: 'Dr. Mejía',
            estado: 'cancelada',
            observaciones: 'Cancelada por el tutor (viaje).',
            origen: 'web'
        },
        // Agenda de hoy
        {
            mascota: mila._id,
            fecha: diaDesdeHoy(0, 9, 0),
            motivo: 'Esterilización — valoración prequirúrgica',
            veterinario: 'Dra. Restrepo',
            estado: 'pendiente',
            origen: 'web'
        },
        {
            mascota: toby._id,
            fecha: diaDesdeHoy(0, 10, 30),
            motivo: 'Limpieza dental',
            veterinario: 'Dra. Salazar',
            estado: 'pendiente',
            origen: 'web'
        },
        {
            mascota: nala._id,
            fecha: diaDesdeHoy(0, 14, 0),
            motivo: 'Control de peso y alimentación',
            veterinario: 'Dr. Mejía',
            estado: 'pendiente',
            origen: 'movil'
        },
        {
            mascota: kiara._id,
            fecha: diaDesdeHoy(0, 16, 30),
            motivo: 'Vacuna múltiple (refuerzo)',
            veterinario: 'Dra. Salazar',
            estado: 'pendiente',
            origen: 'web'
        },
        // Próximos días
        {
            mascota: coco._id,
            fecha: diaDesdeHoy(1, 11, 0),
            motivo: 'Recorte de uñas y revisión de plumaje',
            veterinario: 'Dr. Mejía',
            estado: 'pendiente',
            origen: 'web'
        },
        {
            mascota: simba._id,
            fecha: diaDesdeHoy(1, 15, 0),
            motivo: 'Consulta dermatológica',
            veterinario: 'Dra. Restrepo',
            estado: 'pendiente',
            origen: 'movil'
        },
        {
            mascota: canela._id,
            fecha: diaDesdeHoy(2, 9, 30),
            motivo: 'Vacuna de la tos de las perreras',
            veterinario: 'Dra. Salazar',
            estado: 'pendiente',
            origen: 'web'
        },
        {
            mascota: max._id,
            fecha: diaDesdeHoy(3, 10, 0),
            motivo: 'Control postvacuna',
            veterinario: 'Dra. Salazar',
            estado: 'pendiente',
            origen: 'web'
        },
        {
            mascota: bruno._id,
            fecha: diaDesdeHoy(4, 8, 30),
            motivo: 'Toma de muestras de sangre',
            veterinario: 'Dra. Restrepo',
            estado: 'pendiente',
            origen: 'web'
        },
        {
            mascota: rocky._id,
            fecha: diaDesdeHoy(5, 13, 0),
            motivo: 'Revisión de evolución de cojera',
            veterinario: 'Dra. Restrepo',
            estado: 'pendiente',
            origen: 'movil'
        }
    ]);

    console.log('Carga inicial de HuellitasVet completada:');
    console.log('  Dueños:   ' + duenos.length);
    console.log('  Mascotas: ' + mascotas.length);
    console.log('  Citas:    15 (historial + agenda)');
    await mongoose.disconnect();
}

seed().catch(async (err) => {
    console.error('Error al cargar la base de datos:', err.message);
    await mongoose.disconnect();
    process.exit(1);
});
