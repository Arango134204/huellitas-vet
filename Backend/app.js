'use strict'

const express = require('express');
const cors = require('cors');

const app = express();

const duenoRoutes = require('./routes/duenoroutes');
const mascotaRoutes = require('./routes/mascotaroutes');

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.status(200).send({ message: 'Servidor OK' });
});

// rutas de la api
app.use('/api', duenoRoutes);
app.use('/api', mascotaRoutes);

app.use((req, res) => {
    res.status(404).send({ status: 'error', message: 'Ruta no encontrada' });
});

module.exports = app;
