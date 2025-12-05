const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar JWT secret
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET não definido. Usando valor padrão para desenvolvimento.');
  process.env.JWT_SECRET = 'dev_secret_12345_change_in_production';
}

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do React em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Rotas da API
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/livros', require('./src/routes/livros'));
app.use('/api/usuarios', require('./src/routes/usuarios'));
app.use('/api/emprestimos', require('./src/routes/emprestimos'));

// Rota de saúde (pública)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: '✅ API funcionando', 
    environment: process.env.NODE_ENV,
    authenticated: false,
    timestamp: new Date().toLocaleString('pt-BR')
  });
});

// Rota de saúde protegida
app.get('/api/protected-health', require('./src/middleware/auth').authMiddleware, (req, res) => {
  res.json({ 
    status: '✅ API protegida funcionando', 
    environment: process.env.NODE_ENV,
    authenticated: true,
    user: req.user,
    timestamp: new Date().toLocaleString('pt-BR')
  });
});

// Todas as outras rotas servem o React app
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Configurado' : 'Usando padrão'}`);
  console.log(`📚 API: http://localhost:${PORT}/api`);
});