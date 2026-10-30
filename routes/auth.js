const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
// router.post('/login', authController.login); // Tu ruta existente de login

module.exports = router;