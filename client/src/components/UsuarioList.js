import React, { useState, useEffect } from 'react';
import { usuariosService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const UsuarioList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin()) {
      loadUsuarios();
    }
  }, [isAdmin]);

  const loadUsuarios = async () => {
    try {
      const response = await usuariosService.getAll();
      setUsuarios(response.data);
    } catch (error) {
      setError('Erro ao carregar usuários: ' + error.message);
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin()) {
    return (
      <div className="container">
        <div className="error">
          ⚠️ Acesso restrito. Apenas administradores podem visualizar esta página.
        </div>
      </div>
    );
  }

  if (loading) return <div className="loading">Carregando usuários...</div>;

  return (
    <div className="container">
      <div className="header">
        <h2>👥 Usuários Cadastrados</h2>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Tipo</th>
              <th>Data Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usuario => (
              <tr key={usuario.id}>
                <td>{usuario.nome}</td>
                <td>{usuario.email}</td>
                <td>{usuario.telefone || '-'}</td>
                <td>
                  <span className={`status ${usuario.role === 'admin' ? 'disponivel' : ''}`}>
                    {usuario.role === 'admin' ? '👑 Admin' : '👤 Usuário'}
                  </span>
                </td>
                <td>{new Date(usuario.data_cadastro).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsuarioList;