const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Conexión a MongoDB local
const MONGO_URI = 'mongodb://localhost:27017/servicio_social_db';

mongoose.connect(MONGO_URI)
    .then(() => console.log('Conectado exitosamente a MongoDB'))
    .catch(err => console.error('Error de conexión a MongoDB:', err));

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});