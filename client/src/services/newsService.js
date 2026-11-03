import api from './api.js';

export const getArticles = (params) => api.get('/articles', { params });
export const getArticle = (slug) => api.get(`/articles/${slug}`);
export const getCategories = () => api.get('/categories');
export const searchArticles = (query, params) => api.get('/articles', { params: { search: query, ...params } });
export const toggleSave = (id) => api.post(`/articles/${id}/save`);
