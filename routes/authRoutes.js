const express = require('express');
const router = express.Router();

const { register, login, me } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authmiddleware');

// Registro de usuario
router.post('/register', register);

// Login de usuario
router.post('/login', login);

// Perfil del usuario autenticado
router.get('/me', verifyToken, me);

module.exports = router;
