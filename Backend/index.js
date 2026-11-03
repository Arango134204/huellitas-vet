'use strict'

require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');

const port = process.env.PORT || 3900;
const url = process.env.MONGODB_URI;

mongoose.connect(url)
    .then(() => {
        console.log('Conexión a MongoDB establecida (' + url + ')');

        app.listen(port, () => {
            console.log('Servidor corriendo en http://localhost:' + port);
        });
    })
    .catch(err => {
        console.error('Error al conectar con MongoDB:', err.message);
    });
