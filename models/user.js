const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['estudiante', 'profesor'], default: 'estudiante' },
  metaHoras: { type: Number, default: 40 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);