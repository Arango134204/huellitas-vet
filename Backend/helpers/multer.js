'use strict'

const path = require('path');
const multer = require('multer');

const EXTENSIONES = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
const TAMANO_MAX = 2 * 1024 * 1024; // 2 MB

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/mascotas'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const nombre = 'mascota-' + Date.now() + '-' + Math.round(Math.random() * 1e6) + ext;
        cb(null, nombre);
    }
});

function fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!EXTENSIONES.includes(ext)) {
        return cb(new Error('Formato no permitido. Use PNG, JPG, JPEG, GIF o WEBP'));
    }
    cb(null, true);
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: TAMANO_MAX }
});

module.exports = { upload, EXTENSIONES, TAMANO_MAX };
