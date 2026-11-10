const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

let Service;
try {
  Service = mongoose.model('Service');
} catch {
  const serviceSchema = new mongoose.Schema({
    studentName: { type: String, default: 'Estudiante' },
    studentEmail: { type: String, default: '' },
    organization: { type: String, required: true },
    category: { type: String, default: 'Asistencia comunitaria' },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    hours: { type: Number, required: true },
    description: { type: String, required: true },
    coordinator: { type: String, default: 'Maya Thompson' },
    evidenceUrl: { type: String, default: '' },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    approvedBy: { type: String, default: 'Prof. Carter' },
    approvedDate: { type: String, default: '' },
    feedback: { type: String, default: '' }
  }, { timestamps: true });
  Service = mongoose.model('Service', serviceSchema);
}

// 1. Obtener TODAS las solicitudes (Para que las aprobadas no desaparezcan)
// 1. Obtener solicitudes (Si viene con correo/nombre filtra para el alumno, si no, entrega todo al docente)
router.get('/pending', async (req, res) => {
  try {
    const { studentEmail, studentName } = req.query;
    let filter = {};

    // Si la app móvil envía el correo o nombre del alumno logueado, filtra solo sus horas:
    if (studentEmail || studentName) {
      filter.$or = [
        ...(studentEmail ? [{ studentEmail }] : []),
        ...(studentName ? [{ studentName }] : [])
      ];
    }

    const services = await Service.find(filter).sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener registros', error });
  }
});

// 2. Crear una nueva solicitud de horas (Desde Android)
router.post('/', async (req, res) => {
  try {
    const nuevo = new Service(req.body);
    const guardado = await nuevo.save();
    res.status(201).json(guardado);
  } catch (error) {
    res.status(400).json({ message: 'Error al registrar horas', error });
  }
});

// 3. Aprobar o rechazar horas (Desde Web Docente)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, feedback } = req.body;
    
    // Generar fecha y hora formal de aprobación (Ej: "26 oct 2024, 10:32 a. m.")
    const fechaAprobacion = new Date().toLocaleString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const actualizado = await Service.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        feedback: feedback || '',
        approvedDate: fechaAprobacion
      },
      { new: true }
    );
    res.json(actualizado);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar estado', error });
  }
});

// 4. Modificar una solicitud pendiente (Solo si aún no ha sido evaluada)
router.put('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Solicitud no encontrada' });

    if (service.status !== 'PENDING') {
      return res.status(400).json({ message: 'Solo puedes modificar solicitudes en estado Pendiente' });
    }

    const { organization, hours, date, description } = req.body;
    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      { organization, hours, date, description },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar solicitud', error: error.message });
  }
});

// 5. Cancelar / Eliminar una solicitud pendiente
router.delete('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Solicitud no encontrada' });

    if (service.status !== 'PENDING') {
      return res.status(400).json({ message: 'No puedes cancelar una solicitud que ya fue evaluada' });
    }

    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Solicitud cancelada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al cancelar solicitud', error: error.message });
  }
});

module.exports = router;