const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Si no tienes el modelo Service.js creado, este esquema funcionará directamente
const ServiceSchema = new mongoose.Schema({
  studentName: { type: String, default: 'Estudiante' },
  studentEmail: { type: String },
  organization: { type: String, required: true },
  date: { type: Date, default: Date.now },
  hours: { type: Number, required: true },
  description: { type: String, required: true },
  evidenceUrl: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED'], 
    default: 'PENDING' 
  },
  feedback: { type: String, default: '' }
}, { timestamps: true });

const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);

// 1. Obtener todas las solicitudes pendientes (Para la web del docente)
router.get('/pending', async (req, res) => {
  try {
    const pendingServices = await Service.find({ status: 'PENDING' }).sort({ createdAt: -1 });
    res.json(pendingServices);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener solicitudes pendientes', error });
  }
});

// 2. Crear una nueva solicitud de horas (Desde la App móvil Android)
router.post('/', async (req, res) => {
  try {
    const newService = new Service(req.body);
    const saved = await newService.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Error al registrar servicio', error });
  }
});

// 3. Cambiar estado a APPROVED o REJECTED (Desde la web del docente)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      { status, feedback: feedback || '' },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar estado', error });
  }
});

// 4. Resumen de horas para el Dashboard del estudiante
router.get('/summary', async (req, res) => {
  try {
    const approved = await Service.find({ status: 'APPROVED' });
    const pending = await Service.find({ status: 'PENDING' });

    const approvedHours = approved.reduce((acc, curr) => acc + curr.hours, 0);
    const pendingHours = pending.reduce((acc, curr) => acc + curr.hours, 0);

    res.json({
      targetHours: 80,
      approvedHours,
      pendingHours,
      remainingHours: Math.max(0, 80 - approvedHours)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al calcular resumen', error });
  }
});

module.exports = router;