'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TRANSICIONES = {
    pendiente: ['atendida', 'cancelada'],
    atendida: [],
    cancelada: []
};

const CitaSchema = Schema({
    mascota: {
        type: Schema.Types.ObjectId,
        ref: 'Mascota',
        required: [true, 'La cita debe tener una mascota']
    },
    fecha: {
        type: Date,
        required: [true, 'La fecha de la cita es obligatoria']
    },
    motivo: {
        type: String,
        required: [true, 'El motivo es obligatorio'],
        trim: true,
        maxlength: [200, 'El motivo no puede superar 200 caracteres']
    },
    veterinario: {
        type: String,
        required: [true, 'El veterinario es obligatorio'],
        trim: true
    },
    estado: {
        type: String,
        enum: {
            values: ['pendiente', 'atendida', 'cancelada'],
            message: 'Estado no válido: {VALUE}'
        },
        default: 'pendiente'
    },
    observaciones: {
        type: String,
        maxlength: [500, 'Las observaciones no pueden superar 500 caracteres']
    },
    origen: {
        type: String,
        enum: ['web', 'movil'],
        default: 'web'
    }
}, { timestamps: true });

CitaSchema.statics.puedeTransicionar = function (actual, siguiente) {
    return (TRANSICIONES[actual] || []).includes(siguiente);
};

CitaSchema.statics.TRANSICIONES = TRANSICIONES;

module.exports = mongoose.model('Cita', CitaSchema, 'citas');
