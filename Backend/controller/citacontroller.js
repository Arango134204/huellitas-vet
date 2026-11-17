'use strict'

const Cita = require('../models/cita');
const Mascota = require('../models/mascota');
const { responderError } = require('../helpers/errores');
const {
    inicioFinDia,
    validarDisponibilidad,
    conCandadoAgenda
} = require('../helpers/agenda');

async function poblarCita(id) {
    return Cita.findById(id).populate({
        path: 'mascota',
        select: 'nombre especie imagen dueno',
        populate: { path: 'dueno', select: 'nombre telefono' }
    });
}

function responderRegla(res, err) {
    if (err.status) {
        return res.status(err.status).send({ status: 'error', message: err.message });
    }
    return null;
}

const controller = {

    save: async (req, res) => {
        try {
            const mascota = await Mascota.findById(req.body.mascota);
            if (!mascota) {
                return res.status(404).send({ status: 'error', message: 'La mascota indicada no existe' });
            }
            if (mascota.activa === false) {
                return res.status(409).send({ status: 'error', message: 'No se puede agendar cita a una mascota inactiva' });
            }

            const veterinario = (req.body.veterinario || '').trim();
            const fechaRaw = req.body.fecha;

            const citaStored = await conCandadoAgenda(veterinario || 'sin-vet', fechaRaw || new Date(), async () => {
                const { fechaCita, veterinario: vet } = await validarDisponibilidad({
                    veterinario,
                    fecha: fechaRaw
                });

                const cita = new Cita({
                    mascota: mascota._id,
                    fecha: fechaCita,
                    motivo: req.body.motivo,
                    veterinario: vet,
                    observaciones: req.body.observaciones,
                    origen: req.body.origen || 'web',
                    estado: 'pendiente'
                });
                return cita.save();
            });

            return res.status(201).send({ status: 'success', cita: await poblarCita(citaStored._id) });
        } catch (err) {
            if (responderRegla(res, err)) return;
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

            if (cita.estado !== 'pendiente') {
                return res.status(409).send({
                    status: 'error',
                    message: `No se puede editar una cita en estado «${cita.estado}». Solo se permite cambiar el estado según las transiciones permitidas.`
                });
            }

            if (req.body.mascota !== undefined) {
                const mascota = await Mascota.findById(req.body.mascota);
                if (!mascota) {
                    return res.status(404).send({ status: 'error', message: 'La mascota indicada no existe' });
                }
                if (mascota.activa === false) {
                    return res.status(409).send({ status: 'error', message: 'No se puede asignar una mascota inactiva' });
                }
                cita.mascota = mascota._id;
            }

            if (req.body.motivo !== undefined) cita.motivo = req.body.motivo;
            if (req.body.observaciones !== undefined) cita.observaciones = req.body.observaciones;

            const nuevaFecha = req.body.fecha !== undefined ? req.body.fecha : cita.fecha;
            const nuevoVet = req.body.veterinario !== undefined ? req.body.veterinario : cita.veterinario;

            const actualizada = await conCandadoAgenda(nuevoVet || 'sin-vet', nuevaFecha, async () => {
                const { fechaCita, veterinario: vet } = await validarDisponibilidad({
                    veterinario: nuevoVet,
                    fecha: nuevaFecha,
                    excluirCitaId: cita._id
                });
                cita.fecha = fechaCita;
                cita.veterinario = vet;
                return cita.save();
            });

            return res.status(200).send({ status: 'success', cita: await poblarCita(actualizada._id) });
        } catch (err) {
            if (responderRegla(res, err)) return;
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

            if (!Cita.puedeTransicionar(cita.estado, nuevo)) {
                return res.status(409).send({
                    status: 'error',
                    message: `Transición no permitida: de «${cita.estado}» a «${nuevo}»`,
                    permitidas: Cita.TRANSICIONES[cita.estado] || []
                });
            }

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

            return res.status(200).send({ status: 'success', cita: await poblarCita(cita._id) });
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
