const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { randomUUID } = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_fallback';
const JWT_EXPIRES_IN = '7d';

// Registrar novo usuário
exports.register = (req, res) => {
  const { nome, email, telefone, password } = req.body;

  // Validações
  if (!nome || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
  }

  // Verificar se email já existe
  db.get('SELECT id FROM usuarios WHERE email = ?', [email], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (row) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Criptografar senha
    bcrypt.hash(password, 10, (err, password_hash) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao criptografar senha' });
      }

      const id = randomUUID();
      const role = 'user'; // Default role

      db.run(
        `INSERT INTO usuarios (id, nome, email, telefone, password_hash, role) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, nome, email, telefone || null, password_hash, role],
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // Criar token JWT
          const token = jwt.sign(
            { id, email, nome, role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
          );

          res.status(201).json({
            message: 'Usuário registrado com sucesso',
            user: { id, nome, email, telefone, role },
            token
          });
        }
      );
    });
  });
};

// Login de usuário
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  db.get(
    'SELECT id, nome, email, telefone, password_hash, role FROM usuarios WHERE email = ?',
    [email],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Verificar senha
      bcrypt.compare(password, user.password_hash, (err, isMatch) => {
        if (err || !isMatch) {
          return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Criar token JWT
        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
            nome: user.nome,
            role: user.role
          },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
          message: 'Login realizado com sucesso',
          user: {
            id: user.id,
            nome: user.nome,
            email: user.email,
            telefone: user.telefone,
            role: user.role
          },
          token
        });
      });
    }
  );
};

// Obter perfil do usuário autenticado
exports.getProfile = (req, res) => {
  db.get(
    'SELECT id, nome, email, telefone, role, data_cadastro FROM usuarios WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json(user);
    }
  );
};

// Atualizar perfil do usuário
exports.updateProfile = (req, res) => {
  const { nome, telefone, currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Verificar se usuário está tentando atualizar outro usuário
  if (req.params.id && req.params.id !== userId) {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Você só pode atualizar seu próprio perfil' });
    }
  }

  const targetUserId = req.params.id || userId;

  // Primeiro buscar usuário
  db.get('SELECT password_hash FROM usuarios WHERE id = ?', [targetUserId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Se for mudança de senha, verificar senha atual
    const updatePassword = async () => {
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ error: 'Senha atual é necessária para alterar senha' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
          return res.status(401).json({ error: 'Senha atual incorreta' });
        }

        const password_hash = await bcrypt.hash(newPassword, 10);
        return password_hash;
      }
      return null;
    };

    updatePassword().then(password_hash => {
      const updates = [];
      const values = [];

      if (nome) {
        updates.push('nome = ?');
        values.push(nome);
      }

      if (telefone !== undefined) {
        updates.push('telefone = ?');
        values.push(telefone);
      }

      if (password_hash) {
        updates.push('password_hash = ?');
        values.push(password_hash);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'Nenhum dado para atualizar' });
      }

      values.push(targetUserId);

      db.run(
        `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`,
        values,
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // Buscar usuário atualizado
          db.get(
            'SELECT id, nome, email, telefone, role, data_cadastro FROM usuarios WHERE id = ?',
            [targetUserId],
            (err, updatedUser) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }

              // Se for o próprio usuário, gerar novo token
              if (targetUserId === userId) {
                const newToken = jwt.sign(
                  {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    nome: updatedUser.nome,
                    role: updatedUser.role
                  },
                  JWT_SECRET,
                  { expiresIn: JWT_EXPIRES_IN }
                );

                return res.json({
                  message: 'Perfil atualizado com sucesso',
                  user: updatedUser,
                  token: newPassword ? newToken : undefined
                });
              }

              res.json({
                message: 'Perfil atualizado com sucesso',
                user: updatedUser
              });
            }
          );
        }
      );
    });
  });
};

// Listar todos usuários (apenas admin)
exports.getAllUsers = (req, res) => {
  db.all(
    'SELECT id, nome, email, telefone, role, data_cadastro FROM usuarios ORDER BY nome',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
};