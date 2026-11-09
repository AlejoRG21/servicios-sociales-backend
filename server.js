require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// 1. Middlewares obligatorios
app.use(cors()); // Permite peticiones desde Android Studio y la web
// Aumentar el límite a 15MB para soportar fotos de evidencia en Base64
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// 2. Servir la carpeta de la web docente
app.use(express.static(path.join(__dirname, 'public')));

// 3. Conexión a MongoDB (Usa variable en .env o base de datos local por defecto)
const MONGO_URI = 'mongodb+srv://cesarriverag_db_user:Admin1234@cluster0.wytr1os.mongodb.net/servicios_sociales?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Conectado exitosamente a MongoDB'))
  .catch((err) => console.error('❌ Error conectando a MongoDB:', err.message));

// 4. Rutas de la API (Consumidas por Android y la Web)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));

// 5. Rutas directas para el portal web docente
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/register.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/dashboard.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));

// 6. Iniciar Servidor escuchando en '0.0.0.0' (Crucial para el emulador Android)
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`🚀 Servidor ejecutándose en: http://localhost:${PORT}`);
  console.log(`📡 Escuchando en 0.0.0.0:${PORT} (Listo para Emulador Android)`);
  console.log(`💻 Web Docente lista en: http://localhost:${PORT}/index.html`);
  console.log(`📱 Endpoints de Android en: http://localhost:${PORT}/api/`);
  console.log(`===============================================`);
});