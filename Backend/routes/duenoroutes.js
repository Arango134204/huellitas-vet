'use strict'

const express = require('express');
const duenoController = require('../controller/duenocontroller');

const router = express.Router();

router.post('/dueno/save', duenoController.save);
router.get('/duenos', duenoController.getDuenos);
router.get('/dueno/:id', duenoController.getDueno);
router.put('/dueno/:id', duenoController.update);
router.patch('/dueno/:id/desactivar', duenoController.desactivar);
router.delete('/dueno/:id', duenoController.delete);

module.exports = router;
