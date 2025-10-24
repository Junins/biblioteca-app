const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Usar SQLite para desenvolvimento
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/database.db'  // Render usa /tmp para arquivos temporários
  : path.join(__dirname, '..', 'database.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar com SQLite:', err.message);
  } else {
    console.log('✅ Conectado ao SQLite:', dbPath);
  }
});

// Função para inserir dados de exemplo
const seedData = () => {
  // Verificar se já existem livros
  db.get('SELECT COUNT(*) as count FROM livros', (err, row) => {
    if (err) {
      console.log('ℹ️  Ainda não existe tabela livros ou erro na consulta');
      return;
    }
    
    if (row.count === 0) {
      const { randomUUID } = require('crypto');
      
      const livros = [
        { id: randomUUID(), titulo: 'Dom Casmurro', autor: 'Machado de Assis', isbn: '9788544001820', ano_publicacao: 1899 },
        { id: randomUUID(), titulo: 'O Cortiço', autor: 'Aluísio Azevedo', isbn: '9788572327892', ano_publicacao: 1890 },
        { id: randomUUID(), titulo: 'Iracema', autor: 'José de Alencar', isbn: '9788572328523', ano_publicacao: 1865 }
      ];

      const usuarios = [
        { id: randomUUID(), nome: 'João Silva', email: 'joao@email.com', telefone: '(51) 99999-9999' },
        { id: randomUUID(), nome: 'Maria Santos', email: 'maria@email.com', telefone: '(51) 88888-8888' }
      ];

      livros.forEach(livro => {
        db.run(
          'INSERT INTO livros (id, titulo, autor, isbn, ano_publicacao) VALUES (?, ?, ?, ?, ?)',
          [livro.id, livro.titulo, livro.autor, livro.isbn, livro.ano_publicacao],
          (err) => {
            if (err) console.log('Erro ao inserir livro:', err.message);
          }
        );
      });

      usuarios.forEach(usuario => {
        db.run(
          'INSERT INTO usuarios (id, nome, email, telefone) VALUES (?, ?, ?, ?)',
          [usuario.id, usuario.nome, usuario.email, usuario.telefone],
          (err) => {
            if (err) console.log('Erro ao inserir usuário:', err.message);
          }
        );
      });

      console.log('📚 Dados de exemplo inseridos');
    }
  });
};

// Criar tabelas
db.serialize(() => {
  // Tabela Livros
  db.run(`CREATE TABLE IF NOT EXISTS livros (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    autor TEXT NOT NULL,
    isbn TEXT UNIQUE,
    ano_publicacao INTEGER,
    disponivel BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela Usuarios
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela Emprestimos
  db.run(`CREATE TABLE IF NOT EXISTS emprestimos (
    id TEXT PRIMARY KEY,
    livro_id TEXT NOT NULL,
    usuario_id TEXT NOT NULL,
    data_emprestimo DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_devolucao DATETIME,
    status TEXT DEFAULT 'ativo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (livro_id) REFERENCES livros (id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
  )`, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabelas:', err.message);
    } else {
      console.log('✅ Tabelas criadas/verificadas com sucesso');
      // Chamar seedData após criar as tabelas
      seedData();
    }
  });
});

module.exports = db;