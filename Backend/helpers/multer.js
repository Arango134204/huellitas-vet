'use strict'

const fs = require('fs');
const path = require('path');
const multer = require('multer');

const EXTENSIONES = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
const MIME_PERMITIDOS = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
const TAMANO_MAX = 2 * 1024 * 1024; // 2 MB

/** Firmas (magic bytes) para comprobar que el contenido sea realmente una imagen. */
const FIRMAS = [
    { mime: 'image/png', bytes: [0x89, 0x50, 0x4E, 0x47] },
    { mime: 'image/jpeg', bytes: [0xFF, 0xD8, 0xFF] },
    { mime: 'image/gif', bytes: [0x47, 0x49, 0x46] },
    { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] } // RIFF....WEBP
];

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
    const mime = (file.mimetype || '').toLowerCase();

    if (!EXTENSIONES.includes(ext)) {
        return cb(new Error('Formato no permitido. Use PNG, JPG, JPEG, GIF o WEBP'));
    }
    if (!MIME_PERMITIDOS.includes(mime)) {
        return cb(new Error('El tipo MIME no corresponde a una imagen permitida'));
    }
    cb(null, true);
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: TAMANO_MAX }
});

/**
 * Verifica magic bytes del archivo ya guardado por Multer.
 * Si no es imagen real, lo borra y lanza Error.
 */
function verificarContenidoImagen(rutaArchivo) {
    const fd = fs.openSync(rutaArchivo, 'r');
    const buffer = Buffer.alloc(12);
    fs.readSync(fd, buffer, 0, 12, 0);
    fs.closeSync(fd);

    const esPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    const esJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    const esGif = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
    const esWebp = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46
        && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;

    if (esPng || esJpeg || esGif || esWebp) return true;

    fs.unlinkSync(rutaArchivo);
    const err = new Error('El archivo no es una imagen válida (contenido no coincide con la extensión)');
    err.status = 400;
    throw err;
}

module.exports = { upload, EXTENSIONES, MIME_PERMITIDOS, TAMANO_MAX, verificarContenidoImagen, FIRMAS };
