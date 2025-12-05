import React, { useState, useEffect } from 'react';
import { livrosService } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';

const LivroForm = () => {
  const [livro, setLivro] = useState({
    titulo: '',
    autor: '',
    isbn: '',
    ano_publicacao: '',
    disponivel: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      loadLivro();
    }
  }, [id]);

  const loadLivro = async () => {
    try {
      setLoading(true);
      const response = await livrosService.getById(id);
      setLivro(response.data);
    } catch (error) {
      setError('Erro ao carregar livro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await livrosService.update(id, livro);
      } else {
        await livrosService.create(livro);
      }
      navigate('/');
    } catch (error) {
      setError('Erro ao salvar livro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLivro(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading && isEdit) return <div className="loading">Carregando...</div>;

  return (
    <div className="container">
      <h2>{isEdit ? '✏️ Editar Livro' : '📖 Novo Livro'}</h2>
      
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Título *</label>
          <input
            type="text"
            name="titulo"
            value={livro.titulo}
            onChange={handleChange}
            required
            placeholder="Digite o título do livro"
          />
        </div>

        <div className="form-group">
          <label>Autor *</label>
          <input
            type="text"
            name="autor"
            value={livro.autor}
            onChange={handleChange}
            required
            placeholder="Digite o nome do autor"
          />
        </div>

        <div className="form-group">
          <label>ISBN</label>
          <input
            type="text"
            name="isbn"
            value={livro.isbn}
            onChange={handleChange}
            placeholder="Digite o ISBN (opcional)"
          />
        </div>

        <div className="form-group">
          <label>Ano Publicação</label>
          <input
            type="number"
            name="ano_publicacao"
            value={livro.ano_publicacao}
            onChange={handleChange}
            placeholder="Digite o ano de publicação"
            min="1000"
            max="2025"
          />
        </div>

        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              name="disponivel"
              checked={livro.disponivel}
              onChange={handleChange}
            />
            Disponível para empréstimo
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? '⏳ Salvando...' : '💾 Salvar'}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/')}
            className="btn btn-secondary"
          >
            ↩️ Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default LivroForm;