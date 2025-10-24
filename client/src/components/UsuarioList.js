import React, { useState, useEffect } from 'react';
import { usuariosService } from '../services/api';

const UsuarioList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      const response = await usuariosService.getAll();
      setUsuarios(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Carregando usuários...</div>;

  return (
    <div className="container">
      <h2>👥 Usuários Cadastrados</h2>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Data Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usuario => (
              <tr key={usuario.id}>
                <td>{usuario.nome}</td>
                <td>{usuario.email}</td>
                <td>{usuario.telefone || '-'}</td>
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