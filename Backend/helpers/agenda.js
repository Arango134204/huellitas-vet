'use strict'

const Cita = require('../models/cita');

const MAX_CITAS_DIA_VET = 8;
const VENTANA_MINUTOS = 30;

/** Candados en memoria para serializar reservas del mismo veterinario/día en este proceso Node. */
const candados = new Map();

function inicioFinDia(fecha) {
    const dia = (fecha instanceof Date ? fecha : new Date(fecha)).toISOString().slice(0, 10);
    const inicio = new Date(dia + 'T00:00:00');
    const fin = new Date(dia + 'T23:59:59.999');
    return { dia, inicio, fin };
}

function claveCandado(veterinario, fecha) {
    const { dia } = inicioFinDia(fecha);
    return veterinario.trim().toLowerCase() + '|' + dia;
}

async function conCandadoAgenda(veterinario, fecha, fn) {
    const clave = claveCandado(veterinario, fecha);
    while (candados.has(clave)) {
        await candados.get(clave);
    }
    let liberar;
    const promesa = new Promise((resolve) => { liberar = resolve; });
    candados.set(clave, promesa);
    try {
        return await fn();
    } finally {
        candados.delete(clave);
        liberar();
    }
}

/**
 * Valida fecha, solape y cupo. excluirCitaId evita contar la propia cita al editar.
 * Lanza un Error con .status HTTP y .message para el controlador.
 */
async function validarDisponibilidad({ veterinario, fecha, excluirCitaId = null }) {
    const fechaCita = new Date(fecha);
    if (Number.isNaN(fechaCita.getTime())) {
        const err = new Error('La fecha de la cita no es válida');
        err.status = 400;
        throw err;
    }

    if (fechaCita.getTime() < Date.now() - 60000) {
        const err = new Error('No se puede agendar una cita en el pasado');
        err.status = 400;
        throw err;
    }

    const vet = (veterinario || '').trim();
    if (!vet) {
        const err = new Error('El veterinario es obligatorio');
        err.status = 400;
        throw err;
    }

    const desde = new Date(fechaCita.getTime() - VENTANA_MINUTOS * 60000);
    const hasta = new Date(fechaCita.getTime() + VENTANA_MINUTOS * 60000);
    const filtroChoque = {
        veterinario: vet,
        estado: 'pendiente',
        fecha: { $gte: desde, $lte: hasta }
    };
    if (excluirCitaId) filtroChoque._id = { $ne: excluirCitaId };

    const choque = await Cita.findOne(filtroChoque);
    if (choque) {
        const err = new Error(
            `El veterinario ${vet} ya tiene una cita pendiente en esa franja (±${VENTANA_MINUTOS} min)`
        );
        err.status = 409;
        throw err;
    }

    const { inicio, fin } = inicioFinDia(fechaCita);
    const filtroCupo = {
        veterinario: vet,
        estado: { $ne: 'cancelada' },
        fecha: { $gte: inicio, $lte: fin }
    };
    if (excluirCitaId) filtroCupo._id = { $ne: excluirCitaId };

    const delDia = await Cita.countDocuments(filtroCupo);
    if (delDia >= MAX_CITAS_DIA_VET) {
        const err = new Error(
            `El veterinario ${vet} ya alcanzó el cupo de ${MAX_CITAS_DIA_VET} citas para ese día`
        );
        err.status = 409;
        throw err;
    }

    return { fechaCita, veterinario: vet };
}

module.exports = {
    MAX_CITAS_DIA_VET,
    VENTANA_MINUTOS,
    inicioFinDia,
    validarDisponibilidad,
    conCandadoAgenda
};
