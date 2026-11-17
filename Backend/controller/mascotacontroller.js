'use strict'

const fs = require('fs');
const path = require('path');
const Mascota = require('../models/mascota');
const Dueno = require('../models/dueno');
const Cita = require('../models/cita');
const { responderError } = require('../helpers/errores');
const { verificarContenidoImagen } = require('../helpers/multer');

const RUTA_IMAGENES = path.join(__dirname, '../uploads/mascotas');

async function asegurarDuenoValido(duenoId) {
    const dueno = await Dueno.findById(duenoId);
    if (!dueno) {
        const err = new Error('El dueño indicado no existe');
        err.status = 404;
        throw err;
    }
    if (dueno.activo === false) {
        const err = new Error('No se puede asignar la mascota a un dueño inactivo');
        err.status = 409;
        throw err;
    }
    return dueno;
}

const controller = {

    save: async (req, res) => {
        try {
            await asegurarDuenoValido(req.body.dueno);
            const mascota = new Mascota(req.body);
            const mascotaStored = await mascota.save();
            return res.status(201).send({ status: 'success', mascota: mascotaStored });
        } catch (err) {
            if (err.status) {
                return res.status(err.status).send({ status: 'error', message: err.message });
            }
            return responderError(res, err, 'Error al guardar la mascota');
        }
    },

    getMascotas: async (req, res) => {
        try {
            const filtro = {};
            if (req.query.especie) filtro.especie = req.query.especie;
            if (req.query.dueno) filtro.dueno = req.query.dueno;
            if (req.query.activa === 'false') filtro.activa = false;
            else if (req.query.todas !== 'true') filtro.activa = true;
            if (req.query.buscar) {
                filtro.nombre = { $regex: req.query.buscar, $options: 'i' };
            }

            const mascotas = await Mascota.find(filtro)
                .populate('dueno', 'nombre telefono email')
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
            const historial = await Cita.find({ mascota: mascota._id }).sort({ fecha: -1 });
            return res.status(200).send({ status: 'success', mascota, historial });
        } catch (err) {
            return responderError(res, err, 'Error al obtener la mascota');
        }
    },

    update: async (req, res) => {
        try {
            const mascota = await Mascota.findById(req.params.id);
            if (!mascota) {
                return res.status(404).send({ status: 'error', message: 'No existe la mascota' });
            }

            // Si se reasigna el dueño, se vuelve a validar existencia y estado activo
            if (req.body.dueno !== undefined) {
                await asegurarDuenoValido(req.body.dueno);
            }

            const campos = ['nombre', 'especie', 'raza', 'fechaNacimiento', 'peso', 'dueno', 'activa', 'imagen'];
            for (const campo of campos) {
                if (req.body[campo] !== undefined) mascota[campo] = req.body[campo];
            }

            const mascotaUpdated = await mascota.save();
            return res.status(200).send({ status: 'success', mascota: mascotaUpdated });
        } catch (err) {
            if (err.status) {
                return res.status(err.status).send({ status: 'error', message: err.message });
            }
            return responderError(res, err, 'Error al actualizar la mascota');
        }
    },

    delete: async (req, res) => {
        try {
            // Conservar trazabilidad: no borrar si existe cualquier cita (pendiente, atendida o cancelada)
            const tieneHistorial = await Cita.exists({ mascota: req.params.id });
            if (tieneHistorial) {
                return res.status(409).send({
                    status: 'error',
                    message: 'No se puede eliminar: la mascota tiene historial de citas. Desactívela (activa=false) para conservar la trazabilidad.'
                });
            }

            const mascotaRemoved = await Mascota.findByIdAndDelete(req.params.id);
            if (!mascotaRemoved) {
                return res.status(404).send({ status: 'error', message: 'No existe la mascota' });
            }
            return res.status(200).send({ status: 'success', mascota: mascotaRemoved });
        } catch (err) {
            return responderError(res, err, 'Error al borrar la mascota');
        }
    },

    desactivar: async (req, res) => {
        try {
            const mascota = await Mascota.findByIdAndUpdate(
                req.params.id,
                { activa: false },
                { returnDocument: 'after' }
            );
            if (!mascota) {
                return res.status(404).send({ status: 'error', message: 'No existe la mascota' });
            }
            return res.status(200).send({ status: 'success', mascota });
        } catch (err) {
            return responderError(res, err, 'Error al desactivar la mascota');
        }
    },

    upload: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).send({ status: 'error', message: 'No se envió ninguna imagen (campo imagen)' });
            }

            // Validar contenido real (magic bytes), no solo la extensión
            verificarContenidoImagen(req.file.path);

            const mascota = await Mascota.findById(req.params.id);
            if (!mascota) {
                fs.unlink(req.file.path, () => {});
                return res.status(404).send({ status: 'error', message: 'No existe la mascota' });
            }

            if (mascota.imagen) {
                const anterior = path.join(RUTA_IMAGENES, mascota.imagen);
                if (fs.existsSync(anterior)) fs.unlinkSync(anterior);
            }

            mascota.imagen = req.file.filename;
            await mascota.save();
            return res.status(200).send({ status: 'success', mascota });
        } catch (err) {
            if (req.file && fs.existsSync(req.file.path)) fs.unlink(req.file.path, () => {});
            if (err.status) {
                return res.status(err.status).send({ status: 'error', message: err.message });
            }
            return responderError(res, err, 'Error al subir la imagen');
        }
    },

    getImagen: (req, res) => {
        const archivo = path.basename(req.params.imagen);
        const rutaImagen = path.join(RUTA_IMAGENES, archivo);
        if (!fs.existsSync(rutaImagen)) {
            return res.status(404).send({ status: 'error', message: 'La imagen no existe' });
        }
        return res.sendFile(rutaImagen);
    }

};

module.exports = controller;
