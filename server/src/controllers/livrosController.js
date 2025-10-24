const Livro = require('../models/Livro');

exports.getAllLivros = (req, res) => {
  Livro.getAll((err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Converter boolean do SQLite (0/1) para true/false
    const livros = rows.map(livro => ({
      ...livro,
      disponivel: livro.disponivel === 1
    }));
    res.json(livros);
  });
};

exports.getLivroById = (req, res) => {
  Livro.getById(req.params.id, (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Livro não encontrado' });
    }
    // Converter boolean
    row.disponivel = row.disponivel === 1;
    res.json(row);
  });
};

exports.createLivro = (req, res) => {
  const { titulo, autor } = req.body;
  
  if (!titulo || !autor) {
    return res.status(400).json({ error: 'Título e autor são obrigatórios' });
  }

  Livro.create(req.body, (err, novoLivro) => {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ error: 'ISBN já cadastrado' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json(novoLivro);
  });
};

exports.updateLivro = (req, res) => {
  Livro.update(req.params.id, req.body, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Livro atualizado com sucesso' });
  });
};

exports.deleteLivro = (req, res) => {
  Livro.delete(req.params.id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Livro deletado com sucesso' });
  });
};