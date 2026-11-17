'use strict'

const mongoose = require('mongoose');
const validator = require('validator');
const Schema = mongoose.Schema;

const DuenoSchema = Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true,
        minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
        maxlength: [80, 'El nombre no puede superar 80 caracteres']
    },
    documento: {
        type: String,
        required: [true, 'El documento es obligatorio'],
        unique: true,
        trim: true
    },
    telefono: {
        type: String,
        required: [true, 'El teléfono es obligatorio'],
        trim: true,
        match: [/^[0-9]{7,10}$/, 'El teléfono debe tener entre 7 y 10 dígitos']
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        trim: true,
        lowercase: true,
        validate: {
            validator: (valor) => validator.isEmail(valor),
            message: 'El email no es válido'
        }
    },
    direccion: {
        type: String,
        trim: true,
        maxlength: 150
    },
    activo: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Dueno', DuenoSchema, 'duenos');
