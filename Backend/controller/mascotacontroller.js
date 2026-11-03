'use strict'

const Mascota = require('../models/mascota');
const Dueno = require('../models/dueno');
const { responderError } = require('../helpers/errores');

const controller = {

    save: async (req, res) => {
        try {
            const dueno = await Dueno.findById(req.body.dueno);
            if (!dueno) {
                return res.status(404).send({ status: 'error', message: 'El dueño indicado no existe' });
            }

            const mascota = new Mascota(req.body);
            const mascotaStored = await mascota.save();

            return res.status(201).send({ status: 'success', mascota: mascotaStored });
        } catch (err) {
            return responderError(res, err, 'Error al guardar la mascota');
        }
    },

    getMascotas: async (req, res) => {
        try {
            const filtro = {};
            if (req.query.especie) filtro.especie = req.query.especie;

            const mascotas = await Mascota.find(filtro)
                .populate('dueno', 'nombre telefono')
                .sort({ createdAt: -1 });

            return res.status(200).send({ status: 'success', total: mascotas.length, mascotas });
        } catch (err) {
            return responderError(res, err, 'Error al obtener las mascotas');
        }
    },

    getMascota: async (req, res) => {
        try {
            const mascota = await Mascota.findById(req.params.id).populate('dueno');

            if (!mascota) {
                return res.status(404).send({ status: 'error', message: 'No existe la mascota' });
            }

            return res.status(200).send({ status: 'success', mascota });
        } catch (err) {
            return responderError(res, err, 'Error al obtener la mascota');
        }
    },

    update: async (req, res) => {
        try {
            const mascotaUpdated = await Mascota.findByIdAndUpdate(
                req.params.id,
                req.body,
                { returnDocument: 'after', runValidators: true }
            );

            if (!mascotaUpdated) {
                return res.status(404).send({ status: 'error', message: 'No existe la mascota' });
            }

            return res.status(200).send({ status: 'success', mascota: mascotaUpdated });
        } catch (err) {
            return responderError(res, err, 'Error al actualizar la mascota');
        }
    },

    delete: async (req, res) => {
        try {
            const mascotaRemoved = await Mascota.findByIdAndDelete(req.params.id);

            if (!mascotaRemoved) {
                return res.status(404).send({ status: 'error', message: 'No existe la mascota' });
            }

            return res.status(200).send({ status: 'success', mascota: mascotaRemoved });
        } catch (err) {
            return responderError(res, err, 'Error al borrar la mascota');
        }
    }

};

module.exports = controller;
