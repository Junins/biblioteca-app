const express = require('express');
const router = express.Router();
const livrosController = require('../controllers/livrosController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Todas as rotas de livros agora são protegidas
router.get('/', authMiddleware, livrosController.getAllLivros);
router.get('/:id', authMiddleware, livrosController.getLivroById);
router.post('/', authMiddleware, livrosController.createLivro);
router.put('/:id', authMiddleware, livrosController.updateLivro);

// DELETE apenas para admin
router.delete('/:id', authMiddleware, adminMiddleware, livrosController.deleteLivro);

module.exports = router;