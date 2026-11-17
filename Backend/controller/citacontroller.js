'use strict'

const Cita = require('../models/cita');
const Mascota = require('../models/mascota');
const { responderError } = require('../helpers/errores');

const MAX_CITAS_DIA_VET = 8;
const VENTANA_MINUTOS = 30;

function inicioFinDia(fechaStr) {
    const inicio = new Date(fechaStr + 'T00:00:00');
    const fin = new Date(fechaStr + 'T23:59:59.999');
    return { inicio, fin };
}

const controller = {

    save: async (req, res) => {
        try {
            const mascota = await Mascota.findById(req.body.mascota).populate('dueno');
            if (!mascota) {
                return res.status(404).send({ status: 'error', message: 'La mascota indicada no existe' });
            }
            if (mascota.activa === false) {
                return res.status(409).send({ status: 'error', message: 'No se puede agendar cita a una mascota inactiva' });
            }

            const fecha = new Date(req.body.fecha);
            if (Number.isNaN(fecha.getTime())) {
                return res.status(400).send({ status: 'error', message: 'La fecha de la cita no es válida' });
            }

            // Regla 1: no agendar en el pasado
            if (fecha.getTime() < Date.now() - 60000) {
                return res.status(400).send({
                    status: 'error',
                    message: 'No se puede agendar una cita en el pasado'
                });
            }

            const veterinario = (req.body.veterinario || '').trim();
            if (!veterinario) {
                return res.status(400).send({ status: 'error', message: 'El veterinario es obligatorio' });
            }

            // Regla 2: no solapar citas del mismo veterinario (±30 min)
            const desde = new Date(fecha.getTime() - VENTANA_MINUTOS * 60000);
            const hasta = new Date(fecha.getTime() + VENTANA_MINUTOS * 60000);
            const choque = await Cita.findOne({
                veterinario,
                estado: 'pendiente',
                fecha: { $gte: desde, $lte: hasta }
            });
            if (choque) {
                return res.status(409).send({
                    status: 'error',
                    message: `El veterinario ${veterinario} ya tiene una cita pendiente en esa franja (±${VENTANA_MINUTOS} min)`
                });
            }

            // Regla 3: cupo diario por veterinario
            const dia = fecha.toISOString().slice(0, 10);
            const { inicio, fin } = inicioFinDia(dia);
            const delDia = await Cita.countDocuments({
                veterinario,
                estado: { $ne: 'cancelada' },
                fecha: { $gte: inicio, $lte: fin }
            });
            if (delDia >= MAX_CITAS_DIA_VET) {
                return res.status(409).send({
                    status: 'error',
                    message: `El veterinario ${veterinario} ya alcanzó el cupo de ${MAX_CITAS_DIA_VET} citas para ese día`
                });
            }

            const cita = new Cita({
                mascota: mascota._id,
                fecha,
                motivo: req.body.motivo,
                veterinario,
                observaciones: req.body.observaciones,
                origen: req.body.origen || 'web',
                estado: 'pendiente'
            });

            const citaStored = await cita.save();
            const poblada = await Cita.findById(citaStored._id).populate({
                path: 'mascota',
                populate: { path: 'dueno', select: 'nombre telefono' }
            });

            return res.status(201).send({ status: 'success', cita: poblada });
        } catch (err) {
            return responderError(res, err, 'Error al agendar la cita');
        }
    },

    getCitas: async (req, res) => {
        try {
            const filtro = {};
            if (req.query.estado) filtro.estado = req.query.estado;
            if (req.query.veterinario) {
                filtro.veterinario = { $regex: req.query.veterinario, $options: 'i' };
            }
            if (req.query.mascota) filtro.mascota = req.query.mascota;
            if (req.query.fecha) {
                const { inicio, fin } = inicioFinDia(req.query.fecha);
                filtro.fecha = { $gte: inicio, $lte: fin };
            }

            const citas = await Cita.find(filtro)
                .populate({
                    path: 'mascota',
                    select: 'nombre especie imagen dueno',
                    populate: { path: 'dueno', select: 'nombre telefono' }
                })
                .sort({ fecha: 1 });

            return res.status(200).send({ status: 'success', total: citas.length, citas });
        } catch (err) {
            return responderError(res, err, 'Error al obtener las citas');
        }
    },

    getCita: async (req, res) => {
        try {
            const cita = await Cita.findById(req.params.id).populate({
                path: 'mascota',
                populate: { path: 'dueno' }
            });
            if (!cita) {
                return res.status(404).send({ status: 'error', message: 'No existe la cita' });
            }
            return res.status(200).send({ status: 'success', cita });
        } catch (err) {
            return responderError(res, err, 'Error al obtener la cita');
        }
    },

    update: async (req, res) => {
        try {
            const cita = await Cita.findById(req.params.id);
            if (!cita) {
                return res.status(404).send({ status: 'error', message: 'No existe la cita' });
            }

            // Regla 4: solo se puede editar motivo/observaciones/veterinario/fecha si está pendiente
            if (cita.estado !== 'pendiente') {
                return res.status(409).send({
                    status: 'error',
                    message: `No se puede editar una cita en estado «${cita.estado}». Solo se permite cambiar el estado según las transiciones permitidas.`
                });
            }

            const campos = ['motivo', 'observaciones', 'veterinario', 'fecha', 'mascota'];
            for (const campo of campos) {
                if (req.body[campo] !== undefined) cita[campo] = req.body[campo];
            }

            await cita.save();
            const actualizada = await Cita.findById(cita._id).populate({
                path: 'mascota',
                populate: { path: 'dueno', select: 'nombre telefono' }
            });
            return res.status(200).send({ status: 'success', cita: actualizada });
        } catch (err) {
            return responderError(res, err, 'Error al actualizar la cita');
        }
    },

    cambiarEstado: async (req, res) => {
        try {
            const cita = await Cita.findById(req.params.id);
            if (!cita) {
                return res.status(404).send({ status: 'error', message: 'No existe la cita' });
            }

            const nuevo = req.body.estado;
            if (!nuevo) {
                return res.status(400).send({ status: 'error', message: 'Debe indicar el nuevo estado' });
            }

            // Regla 5: transiciones de estado permitidas
            if (!Cita.puedeTransicionar(cita.estado, nuevo)) {
                return res.status(409).send({
                    status: 'error',
                    message: `Transición no permitida: de «${cita.estado}» a «${nuevo}»`,
                    permitidas: Cita.TRANSICIONES[cita.estado] || []
                });
            }

            // Regla: no marcar como atendida una cita incompleta (sin motivo)
            if (nuevo === 'atendida' && (!cita.motivo || !cita.motivo.trim())) {
                return res.status(400).send({
                    status: 'error',
                    message: 'No se puede marcar como atendida una cita sin motivo'
                });
            }

            cita.estado = nuevo;
            if (req.body.observaciones !== undefined) {
                cita.observaciones = req.body.observaciones;
            }
            await cita.save();

            const actualizada = await Cita.findById(cita._id).populate({
                path: 'mascota',
                populate: { path: 'dueno', select: 'nombre telefono' }
            });

            return res.status(200).send({ status: 'success', cita: actualizada });
        } catch (err) {
            return responderError(res, err, 'Error al cambiar el estado de la cita');
        }
    },

    delete: async (req, res) => {
        try {
            const cita = await Cita.findById(req.params.id);
            if (!cita) {
                return res.status(404).send({ status: 'error', message: 'No existe la cita' });
            }
            if (cita.estado === 'atendida') {
                return res.status(409).send({
                    status: 'error',
                    message: 'No se puede eliminar una cita atendida; forme parte del historial clínico'
                });
            }
            await Cita.findByIdAndDelete(req.params.id);
            return res.status(200).send({ status: 'success', cita });
        } catch (err) {
            return responderError(res, err, 'Error al borrar la cita');
        }
    },

    resumen: async (req, res) => {
        try {
            const porEstado = await Cita.aggregate([
                { $group: { _id: '$estado', total: { $sum: 1 } } }
            ]);

            const hoy = new Date();
            const dia = hoy.toISOString().slice(0, 10);
            const { inicio, fin } = inicioFinDia(dia);
            const hoyCount = await Cita.countDocuments({ fecha: { $gte: inicio, $lte: fin } });
            const pendientesHoy = await Cita.countDocuments({
                fecha: { $gte: inicio, $lte: fin },
                estado: 'pendiente'
            });

            const resumen = { pendiente: 0, atendida: 0, cancelada: 0 };
            porEstado.forEach(r => { resumen[r._id] = r.total; });

            return res.status(200).send({
                status: 'success',
                resumen: {
                    porEstado: resumen,
                    citasHoy: hoyCount,
                    pendientesHoy,
                    total: Object.values(resumen).reduce((a, b) => a + b, 0)
                }
            });
        } catch (err) {
            return responderError(res, err, 'Error al obtener el resumen');
        }
    }

};

module.exports = controller;
