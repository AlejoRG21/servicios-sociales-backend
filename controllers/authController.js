const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { nombre, correo, password, metaHoras } = req.body;

    // 1. Validar si el usuario ya existe
    let user = await User.findOne({ correo });
    if (user) {
      return res.status(400).json({ msg: 'El usuario ya se encuentra registrado' });
    }

    // 2. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Crear el nuevo usuario
    user = new User({
      nombre,
      correo,
      password: hashedPassword,
      metaHoras: metaHoras || 40,
      rol: 'estudiante' // Por defecto desde la app se crean estudiantes
    });

    await user.save();

    // 4. Generar token JWT para inicio de sesión automático
    const payload = { user: { id: user.id, rol: user.rol } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secreto', { expiresIn: '7d' });

    res.status(201).json({
      msg: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
        metaHoras: user.metaHoras
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error en el servidor al registrar usuario' });
  }
};