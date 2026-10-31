require('dotenv').config(); // Cargar variables de entorno desde .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// 1. Middlewares esenciales
app.use(cors()); // Permite conexiones desde Android Studio y navegadores
app.use(express.json()); // Permite recibir JSON en los POST y PUT
app.use(express.urlencoded({ extended: true }));

// 2. Servir la web del profesor (carpeta public)
app.use(express.static(path.join(__dirname, 'public')));

// 3. Conexión a MongoDB (Local o MongoDB Atlas en la nube)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/servicios_sociales';

mongoose.connect(MONGO_URI)
  .then(() => console.log(' Conectado exitosamente a MongoDB'))
  .catch((err) => console.error('❌ Error conectando a MongoDB:', err.message));

// 4. Rutas de la API (Para Android Studio y la Web)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));

// Ruta raíz por defecto (Carga el login del docente)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 5. Iniciar Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Servidor ejecutándose en: http://localhost:${PORT}`);
  console.log(`💻 Web Docente lista en: http://localhost:${PORT}/index.html`);
  console.log(`📱 Endpoints de Android en: http://localhost:${PORT}/api/`);
  console.log(`===============================================`);
});