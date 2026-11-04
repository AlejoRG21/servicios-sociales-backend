const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // o 'bcrypt'
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Si tienes un archivo models/User.js lo importa, si no, define el esquema directamente
let User;
try {
  User = mongoose.model('User');
} catch (e) {
  const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    department: { type: String, default: 'General' },
    role: { type: String, enum: ['STUDENT', 'PROFESSOR', 'ADMIN'], default: 'STUDENT' },
    targetHours: { type: Number, default: 80 }
  }, { timestamps: true });
  User = mongoose.model('User', userSchema);
}

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_super_segura_123';

// 1. REGISTRO DE DOCENTES
router.post('/register-professor', async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo ya está registrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newProfessor = new User({
      name,
      email,
      password: hashedPassword,
      department: department || 'General',
      role: 'PROFESSOR'
    });

    await newProfessor.save();

    res.status(201).json({
      message: 'Docente registrado exitosamente',
      user: {
        id: newProfessor._id,
        name: newProfessor.name,
        email: newProfessor.email,
        role: newProfessor.role
      }
    });
  } catch (error) {
    console.error('Error al registrar profesor:', error);
    res.status(500).json({ message: 'Error interno en el servidor', error: error.message });
  }
});

// 2. REGISTRO DE ESTUDIANTES (Desde la App Móvil Android)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, targetHours } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo ya está registrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newStudent = new User({
      name,
      email,
      password: hashedPassword,
      targetHours: targetHours || 80,
      role: 'STUDENT'
    });

    await newStudent.save();

    res.status(201).json({
      message: 'Estudiante registrado exitosamente',
      user: {
        id: newStudent._id,
        name: newStudent.name,
        email: newStudent.email,
        role: newStudent.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar estudiante', error: error.message });
  }
});

// 3. INICIO DE SESIÓN COMÚN (Web Docente y App Móvil)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // Generar Token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        targetHours: user.targetHours
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
});

// Obtener todos los usuarios registrados (Estudiantes y Profesores)
router.get('/users', async (req, res) => {
  try {
    // Busca todos los usuarios ocultando la contraseña por seguridad (-password)
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al consultar usuarios', error: error.message });
  }
});

// 👉 MUY IMPORTANTE: SIEMPRE EXPORTAR EL ROUTER AL FINAL
module.exports = router;