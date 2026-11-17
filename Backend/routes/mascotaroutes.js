'use strict'

const express = require('express');
const mascotaController = require('../controller/mascotacontroller');
const { upload } = require('../helpers/multer');

const router = express.Router();

router.post('/mascota/save', mascotaController.save);
router.get('/mascotas', mascotaController.getMascotas);
router.get('/mascota/:id', mascotaController.getMascota);
router.put('/mascota/:id', mascotaController.update);
router.delete('/mascota/:id', mascotaController.delete);

router.post('/mascota/upload-image/:id', (req, res, next) => {
    upload.single('imagen')(req, res, (err) => {
        if (err) {
            return res.status(400).send({ status: 'error', message: err.message });
        }
        return mascotaController.upload(req, res);
    });
});

router.get('/mascota/imagen/:imagen', mascotaController.getImagen);

module.exports = router;
