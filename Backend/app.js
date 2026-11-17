'use strict'

const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();

const duenoRoutes = require('./routes/duenoroutes');
const mascotaRoutes = require('./routes/mascotaroutes');
const citaRoutes = require('./routes/citaroutes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.status(200).send({
        message: 'Servidor OK',
        proyecto: 'HuellitasVet API',
        version: '1.0.0'
    });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', duenoRoutes);
app.use('/api', mascotaRoutes);
app.use('/api', citaRoutes);

app.use((req, res) => {
    res.status(404).send({ status: 'error', message: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).send({ status: 'error', message: 'El JSON enviado no es válido' });
    }
    console.error(err);
    res.status(500).send({ status: 'error', message: 'Error interno del servidor' });
});

module.exports = app;
