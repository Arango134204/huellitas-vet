'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MascotaSchema = Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la mascota es obligatorio'],
        trim: true,
        minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
        maxlength: [50, 'El nombre no puede superar 50 caracteres']
    },
    especie: {
        type: String,
        required: [true, 'La especie es obligatoria'],
        enum: {
            values: ['perro', 'gato', 'ave', 'roedor', 'otro'],
            message: 'Especie no válida: {VALUE}'
        }
    },
    raza: {
        type: String,
        trim: true,
        default: 'Criollo'
    },
    fechaNacimiento: Date,
    peso: {
        type: Number,
        min: [0.1, 'El peso debe ser mayor que 0']
    },
    dueno: {
        type: Schema.Types.ObjectId,
        ref: 'Dueno',
        required: [true, 'La mascota debe tener un dueño']
    },
    imagen: {
        type: String,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Mascota', MascotaSchema, 'mascotas');
