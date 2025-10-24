const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { randomUUID } = require('crypto');

// GET todos usuários
router.get('/', (req, res) => {
  db.all('SELECT * FROM usuarios ORDER BY data_cadastro DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST criar usuário
router.post('/', (req, res) => {
  const { nome, email, telefone } = req.body;
  const id = randomUUID();
  
  db.run(
    'INSERT INTO usuarios (id, nome, email, telefone) VALUES (?, ?, ?, ?)',
    [id, nome, email, telefone],
    function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return res.status(400).json({ error: 'Email já cadastrado' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ 
        id, 
        nome, 
        email, 
        telefone,
        data_cadastro: new Date().toISOString()
      });
    }
  );
});

module.exports = router;