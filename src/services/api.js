import axios from 'axios';

// Em produção, usa o mesmo domínio; em desenvolvimento, usa o proxy
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const livrosService = {
  getAll: () => api.get('/livros'),
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