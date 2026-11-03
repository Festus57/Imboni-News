import api from './api.js';

export const getActiveAds = (placement) => api.get('/ads/active', { params: { placement } });
export const trackImpression = (id) => api.post(`/ads/${id}/track`, { type: 'impression' });
export const trackClick = (id) => api.post(`/ads/${id}/track`, { type: 'click' });
export const submitAdRequest = (data) => api.post('/ads/request', data);
