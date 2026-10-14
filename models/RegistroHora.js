const mongoose = require('mongoose');

const RegistroHoraSchema = new mongoose.Schema({
    fecha: { type: Date, required: true },
    cantidadHoras: { type: Number, required: true },
    descripcionActividad: { type: String, required: true },
    estadoAprobacion: { type: String, default: 'Pendiente' }, // 'Pendiente', 'Aprobado', 'Rechazado'
    institucion: { type: mongoose.Schema.Types.ObjectId, ref: 'InstitucionAliada', required: true },
    estudianteId: { type: String, required: true }
});

module.exports = mongoose.model('RegistroHora', RegistroHoraSchema);