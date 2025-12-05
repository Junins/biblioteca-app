import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LivroList from './components/LivroList';
import LivroForm from './components/LivroForm';
import UsuarioList from './components/UsuarioList';
import EmprestimoList from './components/EmprestimoList';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Componente de navegação
const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <h1>📚 Biblioteca Pública</h1>
        <ul className="nav-menu">
          <li><Link to="/" className="nav-link">📖 Livros</Link></li>
          {user && (
            <>
              <li><Link to="/usuarios" className="nav-link">👥 Usuários</Link></li>
              <li><Link to="/emprestimos" className="nav-link">🔄 Empréstimos</Link></li>
              <li><Link to="/profile" className="nav-link">👤 Meu Perfil</Link></li>
              {isAdmin() && <span className="admin-badge">👑 Admin</span>}
              <li>
                <button onClick={handleLogout} className="nav-link logout-btn">
                  🚪 Sair
                </button>
              </li>
            </>
          )}
          {!user && (
            <>
              <li><Link to="/login" className="nav-link">🔐 Login</Link></li>
              <li><Link to="/register" className="nav-link">📝 Cadastro</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

// Componente principal
function AppContent() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Rotas protegidas */}
      <Route path="/" element={
        <ProtectedRoute>
          <LivroList />
        </ProtectedRoute>
      } />
      
      <Route path="/livros/novo" element={
        <ProtectedRoute>
          <LivroForm />
        </ProtectedRoute>
      } />
      
      <Route path="/livros/editar/:id" element={
        <ProtectedRoute>
          <LivroForm />
        </ProtectedRoute>
      } />
      
      <Route path="/usuarios" element={
        <ProtectedRoute requireAdmin={true}>
          <UsuarioList />
        </ProtectedRoute>
      } />
      
      <Route path="/emprestimos" element={
        <ProtectedRoute>
          <EmprestimoList />
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      {/* Rota padrão */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

// App principal
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <AppContent />
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;