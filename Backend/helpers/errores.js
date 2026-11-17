'use strict'

function responderError(res, err, mensaje) {
    if (err.name === 'ValidationError') {
        const errores = Object.values(err.errors).map(e => e.message);
        return res.status(400).send({ status: 'error', message: 'Datos no válidos', errores });
    }

    if (err.name === 'CastError') {
        return res.status(400).send({ status: 'error', message: 'El id enviado no es válido' });
    }

    if (err.code === 11000) {
        return res.status(409).send({ status: 'error', message: 'Ya existe un registro con ese documento' });
    }

    return res.status(500).send({ status: 'error', message: mensaje });
}

module.exports = { responderError };
