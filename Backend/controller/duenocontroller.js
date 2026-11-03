'use strict'

const Dueno = require('../models/dueno');
const Mascota = require('../models/mascota');
const { responderError } = require('../helpers/errores');

const controller = {

    save: async (req, res) => {
        try {
            const dueno = new Dueno(req.body);
            const duenoStored = await dueno.save();

            return res.status(201).send({ status: 'success', dueno: duenoStored });
        } catch (err) {
            return responderError(res, err, 'Error al guardar el dueño');
        }
    },

    getDuenos: async (req, res) => {
        try {
            const filtro = {};
            if (req.query.buscar) {
                filtro.nombre = { $regex: req.query.buscar, $options: 'i' };
            }

            const duenos = await Dueno.find(filtro).sort({ nombre: 1 });

            return res.status(200).send({ status: 'success', total: duenos.length, duenos });
        } catch (err) {
            return responderError(res, err, 'Error al obtener los dueños');
        }
    },

    getDueno: async (req, res) => {
        try {
            const dueno = await Dueno.findById(req.params.id);

            if (!dueno) {
                return res.status(404).send({ status: 'error', message: 'No existe el dueño' });
            }

            const mascotas = await Mascota.find({ dueno: dueno._id });

            return res.status(200).send({ status: 'success', dueno, mascotas });
        } catch (err) {
            return responderError(res, err, 'Error al obtener el dueño');
        }
    },

    update: async (req, res) => {
        try {
            const duenoUpdated = await Dueno.findByIdAndUpdate(
                req.params.id,
                req.body,
                { returnDocument: 'after', runValidators: true }
            );

            if (!duenoUpdated) {
                return res.status(404).send({ status: 'error', message: 'No existe el dueño' });
            }

            return res.status(200).send({ status: 'success', dueno: duenoUpdated });
        } catch (err) {
            return responderError(res, err, 'Error al actualizar el dueño');
        }
    },

    delete: async (req, res) => {
        try {
            const tieneMascotas = await Mascota.exists({ dueno: req.params.id });

            if (tieneMascotas) {
                return res.status(409).send({
                    status: 'error',
                    message: 'No se puede borrar: el dueño tiene mascotas registradas'
                });
            }

            const duenoRemoved = await Dueno.findByIdAndDelete(req.params.id);

            if (!duenoRemoved) {
                return res.status(404).send({ status: 'error', message: 'No existe el dueño' });
            }

            return res.status(200).send({ status: 'success', dueno: duenoRemoved });
        } catch (err) {
            return responderError(res, err, 'Error al borrar el dueño');
        }
    }

};

module.exports = controller;
