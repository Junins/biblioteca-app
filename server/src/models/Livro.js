const db = require('../config/database');
const { randomUUID } = require('crypto');

class Livro {
  static getAll(callback) {
    db.all('SELECT * FROM livros ORDER BY created_at DESC', callback);
  }

  static getById(id, callback) {
    db.get('SELECT * FROM livros WHERE id = ?', [id], callback);
  }

  static create(livro, callback) {
    const id = randomUUID();
    const { titulo, autor, isbn, ano_publicacao, disponivel } = livro;
    db.run(
      'INSERT INTO livros (id, titulo, autor, isbn, ano_publicacao, disponivel) VALUES (?, ?, ?, ?, ?, ?)',
      [id, titulo, autor, isbn, ano_publicacao, disponivel !== false ? 1 : 0],
      function(err) {
        callback(err, { id, ...livro });
      }
    );
  }

  static update(id, livro, callback) {
    const { titulo, autor, isbn, ano_publicacao, disponivel } = livro;
    db.run(
      'UPDATE livros SET titulo = ?, autor = ?, isbn = ?, ano_publicacao = ?, disponivel = ? WHERE id = ?',
      [titulo, autor, isbn, ano_publicacao, disponivel ? 1 : 0, id],
      callback
    );
  }

  static delete(id, callback) {
    db.run('DELETE FROM livros WHERE id = ?', [id], callback);
  }
}

module.exports = Livro;