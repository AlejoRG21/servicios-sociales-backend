const mongoose = require('mongoose');

const InstitucionAliadaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    direccion: { type: String, required: true },
    contacto: { type: String, required: true }
});

module.exports = mongoose.model('InstitucionAliada', InstitucionAliadaSchema);