'use strict'

require('dotenv').config();

const mongoose = require('mongoose');
const Dueno = require('./models/dueno');
const Mascota = require('./models/mascota');
const Cita = require('./models/cita');

function diaDesdeHoy(dias, hora) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    fecha.setHours(hora, 0, 0, 0);
    return fecha;
}

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);

    await Promise.all([Dueno.deleteMany({}), Mascota.deleteMany({}), Cita.deleteMany({})]);

    const [laura, andres, camila] = await Dueno.create([
        { nombre: 'Laura Gómez', documento: '1088123456', telefono: '3104567890', email: 'laura.gomez@mail.com', direccion: 'Cra 7 # 19-40, Pereira' },
        { nombre: 'Andrés Ríos', documento: '1088654321', telefono: '3127788990', email: 'andres.rios@mail.com', direccion: 'Cuba, Pereira' },
        { nombre: 'Camila Torres', documento: '42098765', telefono: '3001122334', email: 'camila.torres@mail.com', direccion: 'Dosquebradas' }
    ]);

    const [rocky, misha, kiwi, toby] = await Mascota.create([
        { nombre: 'Rocky', especie: 'perro', raza: 'Labrador', fechaNacimiento: '2021-04-12', peso: 28.5, dueno: laura._id },
        { nombre: 'Misha', especie: 'gato', raza: 'Angora', fechaNacimiento: '2022-09-01', peso: 4.2, dueno: laura._id },
        { nombre: 'Kiwi', especie: 'ave', raza: 'Periquito', fechaNacimiento: '2024-01-20', peso: 0.3, dueno: andres._id },
        { nombre: 'Toby', especie: 'perro', fechaNacimiento: '2019-11-05', peso: 12, dueno: camila._id }
    ]);

    await Cita.create([
        { mascota: rocky._id, fecha: diaDesdeHoy(0, 10), motivo: 'Vacuna antirrábica', veterinario: 'Dra. Salazar', origen: 'web' },
        { mascota: misha._id, fecha: diaDesdeHoy(0, 14), motivo: 'Control de peso', veterinario: 'Dr. Mejía', origen: 'movil' },
        { mascota: toby._id, fecha: diaDesdeHoy(1, 15), motivo: 'Limpieza dental', veterinario: 'Dra. Salazar', origen: 'web' },
        { mascota: kiwi._id, fecha: diaDesdeHoy(-3, 10), motivo: 'Revisión de plumaje', veterinario: 'Dr. Mejía', estado: 'atendida', observaciones: 'Se recomienda vitamina A', origen: 'web' }
    ]);

    console.log('Datos de prueba: 3 dueños, 4 mascotas, 4 citas');
    await mongoose.disconnect();
}

seed().catch(async (err) => {
    console.error('Error al cargar los datos:', err.message);
    await mongoose.disconnect();
    process.exit(1);
});
