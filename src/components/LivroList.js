import React, { useState, useEffect } from 'react';
import { livrosService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const LivroList = () => {
  const [livros, setLivros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadLivros();
  }, []);

  const loadLivros = async () => {
    try {
      setError('');
      const response = await livrosService.getAll();
      setLivros(response.data);
    } catch (error) {
      setError('Erro ao carregar livros: ' + error.message);
      console.error('Erro ao carregar livros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, titulo) => {
    if (window.confirm(`Tem certeza que deseja excluir o livro "${titulo}"?`)) {
      try {
        await livrosService.delete(id);
        loadLivros();
      } catch (error) {
        setError('Erro ao excluir livro: ' + error.message);
        console.error('Erro ao excluir livro:', error);
      }
    }
  };

  if (loading) return <div className="loading">📚 Carregando livros...</div>;

  return (
    <div className="container">
      <div className="header">
        <h2>📖 Lista de Livros</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/livros/novo')}
        >
          ➕ Novo Livro
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Ano</th>
              <th>ISBN</th>
              <th>Disponível</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {livros.map(livro => (
              <tr key={livro.id}>
                <td>{livro.titulo}</td>
                <td>{livro.autor}</td>
                <td>{livro.ano_publicacao}</td>
                <td>{livro.isbn || '-'}</td>
                <td>
                  <span className={`status ${livro.disponivel ? 'disponivel' : 'indisponivel'}`}>
                    {livro.disponivel ? '✅ Sim' : '❌ Não'}
                  </span>
                </td>
                <td className="actions">
                  <button 
                    className="btn btn-edit"
                    onClick={() => navigate(`/livros/editar/${livro.id}`)}
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    className="btn btn-delete"
                    onClick={() => handleDelete(livro.id, livro.titulo)}
                  >
                    🗑️ Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {livros.length === 0 && (
          <div className="empty-state">
            📝 Nenhum livro cadastrado. Clique em "Novo Livro" para adicionar.
          </div>
        )}
      </div>
    </div>
  );
};

export default LivroList;