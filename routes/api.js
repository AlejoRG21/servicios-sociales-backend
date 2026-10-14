const express = require('express');
const router = express.Router();
const InstitucionAliada = require('../models/InstitucionAliada');
const RegistroHora = require('../models/RegistroHora');

// --- CRUD INSTITUCIONES ---
router.get('/instituciones', async (req, res) => {
    try {
        const instituciones = await InstitucionAliada.find();
        res.status(200).json(instituciones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/instituciones/:id', async (req, res) => {
    try {
        const institucion = await InstitucionAliada.findById(req.params.id);
        if (!institucion) return res.status(404).json({ error: 'Institución no encontrada' });
        res.status(200).json(institucion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/instituciones', async (req, res) => {
    try {
        const nueva = new InstitucionAliada(req.body);
        const guardada = await nueva.save();
        res.status(201).json(guardada);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/instituciones/:id', async (req, res) => {
    try {
        const actualizada = await InstitucionAliada.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!actualizada) return res.status(404).json({ error: 'Institución no encontrada' });
        res.status(200).json(actualizada);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/instituciones/:id', async (req, res) => {
    try {
        const eliminada = await InstitucionAliada.findByIdAndDelete(req.params.id);
        if (!eliminada) return res.status(404).json({ error: 'Institución no encontrada' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- REGISTROS DE HORAS Y REGLA DE NEGOCIO ---
router.get('/registros-horas', async (req, res) => {
    try {
        const { status } = req.query;
        let filtro = {};
        if (status) {
            filtro.estadoAprobacion = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        }
        const registros = await RegistroHora.find(filtro).populate('institucion');
        res.status(200).json(registros);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/registros-horas', async (req, res) => {
    try {
        const { cantidadHoras } = req.body;
        // REGLA DE NEGOCIO: Validar límite en servidor
        if (!cantidadHoras || cantidadHoras <= 0) {
            return res.status(400).json({ error: 'La cantidad de horas debe ser mayor a cero.' });
        }
        if (cantidadHoras > 8) {
            return res.status(400).json({ error: 'No se permite registrar más de 8 horas en una sola jornada.' });
        }

        const nuevoRegistro = new RegistroHora({ ...req.body, estadoAprobacion: 'Pendiente' });
        const guardado = await nuevoRegistro.save();
        res.status(201).json(guardado);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.patch('/registros-horas/:id/aprobar', async (req, res) => {
    try {
        const registroAprobado = await RegistroHora.findByIdAndUpdate(
            req.params.id,
            { estadoAprobacion: 'Aprobado' },
            { new: true }
        ).populate('institucion');
        if (!registroAprobado) return res.status(404).json({ error: 'Registro no encontrado' });
        res.status(200).json(registroAprobado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;