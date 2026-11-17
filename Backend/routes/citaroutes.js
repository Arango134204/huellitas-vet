'use strict'

const express = require('express');
const citaController = require('../controller/citacontroller');

const router = express.Router();

router.post('/cita/save', citaController.save);
router.get('/citas', citaController.getCitas);
router.get('/citas/resumen', citaController.resumen);
router.get('/cita/:id', citaController.getCita);
router.put('/cita/:id', citaController.update);
router.patch('/cita/:id/estado', citaController.cambiarEstado);
router.delete('/cita/:id', citaController.delete);

module.exports = router;
