import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LivroList from './components/LivroList';
import LivroForm from './components/LivroForm';
import UsuarioList from './components/UsuarioList';
import EmprestimoList from './components/EmprestimoList';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <h1>📚 Biblioteca Pública</h1>
            <ul className="nav-menu">
              <li><Link to="/" className="nav-link">📖 Livros</Link></li>
              <li><Link to="/usuarios" className="nav-link">👥 Usuários</Link></li>
              <li><Link to="/emprestimos" className="nav-link">🔄 Empréstimos</Link></li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<LivroList />} />
            <Route path="/livros/novo" element={<LivroForm />} />
            <Route path="/livros/editar/:id" element={<LivroForm />} />
            <Route path="/usuarios" element={<UsuarioList />} />
            <Route path="/emprestimos" element={<EmprestimoList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;