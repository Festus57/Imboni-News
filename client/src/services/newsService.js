import api from './api.js';

// ── Articles ──────────────────────────────────────────────────────────────────
export const getArticles  = (params) => api.get('/articles', { params });
export const getArticle   = (slug)   => api.get(`/articles/${slug}`);
export const getCategories = ()      => api.get('/categories');
export const searchArticles = (query, params) => api.get('/articles', { params: { search: query, ...params } });
export const toggleSave   = (id)     => api.post(`/articles/${id}/save`);

// ── Videos ───────────────────────────────────────────────────────────────────
export const getVideos    = (params) => api.get('/videos', { params });
export const getVideo     = (slug)   => api.get(`/videos/${slug}`);
export const getShorts    = ()       => api.get('/videos/shorts');
export const getLiveStreams = ()      => api.get('/videos/live');

// ── Comments ─────────────────────────────────────────────────────────────────
export const getComments  = (articleId) => api.get('/comments', { params: { article: articleId } });
export const postComment  = (data)      => api.post('/comments', data);
export const deleteComment = (id)       => api.delete(`/comments/${id}`);

// ── News Tips ─────────────────────────────────────────────────────────────────
export const submitNewsTip = (data) => api.post('/newstips', data);
