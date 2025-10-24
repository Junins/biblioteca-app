const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { randomUUID } = require('crypto');

// GET todos empréstimos com informações dos livros e usuários
router.get('/', (req, res) => {
  db.all(`
    SELECT e.*, l.titulo as livro_titulo, u.nome as usuario_nome 
    FROM emprestimos e
    JOIN livros l ON e.livro_id = l.id
    JOIN usuarios u ON e.usuario_id = u.id
    ORDER BY e.data_emprestimo DESC
  `, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST criar empréstimo
router.post('/', (req, res) => {
  const { livro_id, usuario_id } = req.body;
  const id = randomUUID();
  
  // Verificar se livro está disponível
  db.get('SELECT disponivel FROM livros WHERE id = ?', [livro_id], (err, livro) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!livro) {
      return res.status(404).json({ error: 'Livro não encontrado' });
    }
    
    if (!livro.disponivel) {
      return res.status(400).json({ error: 'Livro não disponível' });
    }

    // Criar empréstimo
    db.run(
      'INSERT INTO emprestimos (id, livro_id, usuario_id) VALUES (?, ?, ?)',
      [id, livro_id, usuario_id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Marcar livro como indisponível
        db.run('UPDATE livros SET disponivel = 0 WHERE id = ?', [livro_id], (err) => {
          if (err) {
            console.error('Erro ao atualizar disponibilidade:', err);
          }
        });

        res.status(201).json({ 
          id, 
          livro_id, 
          usuario_id, 
          status: 'ativo',
          data_emprestimo: new Date().toISOString()
        });
      }
    );
  });
});

// PUT devolver livro
router.put('/:id/devolver', (req, res) => {
  const { id } = req.params;
  
  // Buscar empréstimo
  db.get('SELECT * FROM emprestimos WHERE id = ?', [id], (err, emprestimo) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!emprestimo) {
      return res.status(404).json({ error: 'Empréstimo não encontrado' });
    }

    // Atualizar empréstimo
    db.run(
      'UPDATE emprestimos SET status = ?, data_devolucao = CURRENT_TIMESTAMP WHERE id = ?',
      ['devolvido', id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Marcar livro como disponível
        db.run('UPDATE livros SET disponivel = 1 WHERE id = ?', [emprestimo.livro_id], (err) => {
          if (err) {
            console.error('Erro ao atualizar disponibilidade:', err);
          }
        });

        res.json({ 
          message: 'Livro devolvido com sucesso',
          id: id
        });
      }
    );
  });
});

module.exports = router;