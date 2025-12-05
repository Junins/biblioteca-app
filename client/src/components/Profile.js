import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nome: user.nome || '',
        telefone: user.telefone || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');
    setSuccess('');

    const { newPassword, confirmNewPassword, currentPassword, ...profileData } = formData;

    // Validações para senha
    if (newPassword || confirmNewPassword) {
      if (!currentPassword) {
        setError('Digite sua senha atual para alterar a senha');
        setLoading(false);
        return;
      }

      if (newPassword.length < 6) {
        setError('A nova senha deve ter no mínimo 6 caracteres');
        setLoading(false);
        return;
      }

      if (newPassword !== confirmNewPassword) {
        setError('As novas senhas não coincidem');
        setLoading(false);
        return;
      }

      profileData.currentPassword = currentPassword;
      profileData.newPassword = newPassword;
    }

    const result = await updateProfile(profileData);
    
    setLoading(false);
    
    if (result.success) {
      setSuccess('Perfil atualizado com sucesso!');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="container">
        <div className="error">Você precisa estar logado para acessar esta página</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h2>👤 Meu Perfil</h2>
        <button 
          className="btn btn-secondary"
          onClick={handleLogout}
        >
          🚪 Sair
        </button>
      </div>

      <div className="profile-info">
        <div className="profile-card">
          <h3>Informações da conta</h3>
          <div className="profile-details">
            <p><strong>Nome:</strong> {user.nome}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Telefone:</strong> {user.telefone || 'Não informado'}</p>
            <p><strong>Tipo de usuário:</strong> 
              <span className={`status ${user.role === 'admin' ? 'disponivel' : ''}`}>
                {user.role === 'admin' ? ' 👑 Administrador' : ' 👤 Usuário'}
              </span>
            </p>
            <p><strong>Data de cadastro:</strong> {new Date(user.data_cadastro).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <div className="profile-card">
          <h3>Editar Perfil</h3>
          
          {success && <div className="success">{success}</div>}
          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Seu nome completo"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Telefone</label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(51) 99999-9999"
                disabled={loading}
              />
            </div>

            <h4>Alterar Senha (opcional)</h4>
            
            <div className="form-group">
              <label>Senha atual</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Digite sua senha atual"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Nova senha</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Confirmar nova senha</label>
              <input
                type="password"
                name="confirmNewPassword"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                placeholder="Digite a nova senha novamente"
                disabled={loading}
              />
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? '⏳ Salvando...' : '💾 Salvar alterações'}
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
      </div>
    </div>
  );
};

export default Profile;