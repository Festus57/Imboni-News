import api from './api.js';

export const getVideos = (params) => api.get('/videos', { params });
export const getVideo = (slug) => api.get(`/videos/${slug}`);
export const getShorts = () => api.get('/videos/shorts');
export const getLiveStreams = () => api.get('/videos/live');
