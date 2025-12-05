const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Rotas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rotas protegidas
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/profile/:id', authMiddleware, authController.updateProfile);

// Rotas apenas para admin
router.get('/users', authMiddleware, adminMiddleware, authController.getAllUsers);

module.exports = router;