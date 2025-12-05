import React, { useState, useEffect } from 'react';
import { emprestimosService } from '../services/api';

const EmprestimoList = () => {
  const [emprestimos, setEmprestimos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmprestimos();
  }, []);

  const loadEmprestimos = async () => {
    try {
      const response = await emprestimosService.getAll();
      setEmprestimos(response.data);
    } catch (error) {
      console.error('Erro ao carregar empréstimos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDevolucao = async (id) => {
    if (window.confirm('Confirmar devolução do livro?')) {
      try {
        await emprestimosService.devolver(id);
        loadEmprestimos(); // Recarregar lista
      } catch (error) {
        console.error('Erro ao devolver livro:', error);
        alert('Erro ao devolver livro: ' + error.message);
      }
    }
  };

  if (loading) return <div className="loading">Carregando empréstimos...</div>;

  return (
    <div className="container">
      <h2>🔄 Empréstimos Ativos</h2>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Livro</th>
              <th>Usuário</th>
              <th>Data Empréstimo</th>
              <th>Data Devolução</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {emprestimos.map(emprestimo => (
              <tr key={emprestimo.id}>
                <td>{emprestimo.livro_titulo}</td>
                <td>{emprestimo.usuario_nome}</td>
                <td>{new Date(emprestimo.data_emprestimo).toLocaleDateString('pt-BR')}</td>
                <td>{emprestimo.data_devolucao ? new Date(emprestimo.data_devolucao).toLocaleDateString('pt-BR') : '-'}</td>
                <td>
                  <span className={`status ${emprestimo.status === 'ativo' ? 'disponivel' : 'indisponivel'}`}>
                    {emprestimo.status === 'ativo' ? '🟢 Ativo' : '🔴 Devolvido'}
                  </span>
                </td>
                <td>
                  {emprestimo.status === 'ativo' && (
                    <button 
                      className="btn btn-edit"
                      onClick={() => handleDevolucao(emprestimo.id)}
                    >
                      📚 Devolver
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {emprestimos.length === 0 && (
          <div className="empty-state">
            📝 Nenhum empréstimo registrado.
          </div>
        )}
      </div>
    </div>
  );
};

export default EmprestimoList;