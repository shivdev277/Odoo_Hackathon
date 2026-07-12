import apiClient from '../../../services/apiClient';

const unwrapData = (response) => response?.data?.data ?? response?.data;

export const getKpis = async () => unwrapData(await apiClient.get('/dashboard/kpis'));
export const getOverdue = async () => unwrapData(await apiClient.get('/dashboard/overdue'));
export const getRecentActivity = async () => unwrapData(await apiClient.get('/activity-logs', { params: { limit: 4 } }));