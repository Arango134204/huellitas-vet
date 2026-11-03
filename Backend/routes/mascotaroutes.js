'use strict'

const express = require('express');
const mascotaController = require('../controller/mascotacontroller');

const router = express.Router();

router.post('/mascota/save', mascotaController.save);
router.get('/mascotas', mascotaController.getMascotas);
router.get('/mascota/:id', mascotaController.getMascota);
router.put('/mascota/:id', mascotaController.update);
router.delete('/mascota/:id', mascotaController.delete);

module.exports = router;
