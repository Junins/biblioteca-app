import axios from 'axios';

// Em produção, usa o mesmo domínio; em desenvolvimento, usa o proxy
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api';

console.log('🔗 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Token no request:', token ? 'Presente' : 'Ausente');
    console.log('Request para:', config.url);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token adicionado ao header');
    } else {
      console.log('Token não encontrado no localStorage');
    }
    return config;
  },
  (error) => {
    console.error('Erro no request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => {
    console.log('Response recebido:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Erro na response:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      console.log('Status 401 detectado - Token inválido/expirado');
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Verificar se não estamos já na página de login
      if (!window.location.pathname.includes('/login')) {
        console.log('Redirecionando para login');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const livrosService = {
  getAll: () => {
    console.log('Chamando GET /livros');return api.get('/livros');},
  getById: (id) => api.get(`/livros/${id}`),
  create: (livro) => api.post('/livros', livro),
  update: (id, livro) => api.put(`/livros/${id}`, livro),
  delete: (id) => api.delete(`/livros/${id}`),
};

export const usuariosService = {
  getAll: () => api.get('/usuarios'),
  create: (usuario) => api.post('/usuarios', usuario),
};

export const emprestimosService = {
  getAll: () => api.get('/emprestimos'),
  create: (emprestimo) => api.post('/emprestimos', emprestimo),
  devolver: (id) => api.put(`/emprestimos/${id}/devolver`),
};

export default api;