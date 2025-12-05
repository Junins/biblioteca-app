const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

// Usar SQLite para desenvolvimento
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/database.db'
  : path.join(__dirname, '..', 'database.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar com SQLite:', err.message);
  } else {
    console.log('✅ Conectado ao SQLite:', dbPath);
  }
});

// Função para criar admin padrão
const createDefaultAdmin = async () => {
  return new Promise((resolve, reject) => {
    // Verificar se já existe admin
    db.get('SELECT id FROM usuarios WHERE email = ?', ['admin@biblioteca.com'], async (err, row) => {
      if (err) {
        console.error('Erro ao verificar admin:', err);
        return resolve();
      }

      if (!row) {
        try {
          const password_hash = await bcrypt.hash('admin123', 10);
          const adminId = randomUUID();
          
          db.run(
            `INSERT INTO usuarios (id, nome, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
            [adminId, 'Administrador', 'admin@biblioteca.com', password_hash, 'admin'],
            (err) => {
              if (err) {
                console.error('Erro ao criar admin:', err.message);
              } else {
                console.log('👑 Admin padrão criado: admin@biblioteca.com / admin123');
              }
              resolve();
            }
          );
        } catch (error) {
          console.error('Erro ao criar admin:', error);
          resolve();
        }
      } else {
        resolve();
      }
    });
  });
};

// Criar tabelas atualizadas
db.serialize(() => {
  // Tabela Usuarios (ATUALIZADA)
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT,
    password_hash TEXT,
    role TEXT DEFAULT 'user',
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela Livros (mantida)
  db.run(`CREATE TABLE IF NOT EXISTS livros (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    autor TEXT NOT NULL,
    isbn TEXT UNIQUE,
    ano_publicacao INTEGER,
    disponivel BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela Emprestimos (mantida)
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
  )`, async (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabelas:', err.message);
    } else {
      console.log('✅ Tabelas criadas/verificadas com sucesso');
      
      // Criar admin padrão
      await createDefaultAdmin();
      
      // Seed data apenas em desenvolvimento
      if (process.env.NODE_ENV !== 'production') {
        seedData();
      }
    }
  });
});

// Função para inserir dados de exemplo (apenas em desenvolvimento)
const seedData = () => {
  // Verificar se já existem livros
  db.get('SELECT COUNT(*) as count FROM livros', (err, row) => {
    if (err) {
      console.log('ℹ️  Ainda não existe tabela livros ou erro na consulta');
      return;
    }
    
    if (row.count === 0) {
      const livros = [
        { id: randomUUID(), titulo: 'Dom Casmurro', autor: 'Machado de Assis', isbn: '9788544001820', ano_publicacao: 1899 },
        { id: randomUUID(), titulo: 'O Cortiço', autor: 'Aluísio Azevedo', isbn: '9788572327892', ano_publicacao: 1890 },
        { id: randomUUID(), titulo: 'Iracema', autor: 'José de Alencar', isbn: '9788572328523', ano_publicacao: 1865 }
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

      console.log('📚 Dados de exemplo inseridos');
    }
  });
};

module.exports = db;