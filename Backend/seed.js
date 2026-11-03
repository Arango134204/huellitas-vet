'use strict'

// Carga datos de prueba. Uso: npm run seed (borra y vuelve a crear las colecciones)

require('dotenv').config();

const mongoose = require('mongoose');
const Dueno = require('./models/dueno');
const Mascota = require('./models/mascota');

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);

    await Promise.all([Dueno.deleteMany({}), Mascota.deleteMany({})]);

    const [laura, andres, camila] = await Dueno.create([
        { nombre: 'Laura Gómez', documento: '1088123456', telefono: '3104567890', email: 'laura.gomez@mail.com', direccion: 'Cra 7 # 19-40, Pereira' },
        { nombre: 'Andrés Ríos', documento: '1088654321', telefono: '3127788990', email: 'andres.rios@mail.com', direccion: 'Cuba, Pereira' },
        { nombre: 'Camila Torres', documento: '42098765', telefono: '3001122334', email: 'camila.torres@mail.com', direccion: 'Dosquebradas' }
    ]);

    await Mascota.create([
        { nombre: 'Rocky', especie: 'perro', raza: 'Labrador', fechaNacimiento: '2021-04-12', peso: 28.5, dueno: laura._id },
        { nombre: 'Misha', especie: 'gato', raza: 'Angora', fechaNacimiento: '2022-09-01', peso: 4.2, dueno: laura._id },
        { nombre: 'Kiwi', especie: 'ave', raza: 'Periquito', fechaNacimiento: '2024-01-20', peso: 0.3, dueno: andres._id },
        { nombre: 'Toby', especie: 'perro', fechaNacimiento: '2019-11-05', peso: 12, dueno: camila._id }
    ]);

    console.log('Datos de prueba cargados: 3 dueños, 4 mascotas');
    await mongoose.disconnect();
}

seed().catch(async (err) => {
    console.error('Error al cargar los datos:', err.message);
    await mongoose.disconnect();
    process.exit(1);
});
