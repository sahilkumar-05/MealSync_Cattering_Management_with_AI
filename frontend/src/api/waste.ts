import api from './axios';

export interface WasteLog {
  id: string;
  dishName: string;
  logDate: string;
  wastedKg: number;
  notes?: string;
}

export const getWasteLogs = async (): Promise<WasteLog[]> => {
  const response = await api.get('/waste');
  return response.data;
};

export const createWasteLog = async (data: {
  menuItemId: string;
  dishName: string;
  logDate: string;
  wastedKg: number;
  notes?: string;
}) => {
  const response = await api.post('/waste', data);
  return response.data;
};

export const getWasteByDish = async () => {
  const response = await api.get('/waste/analytics/by-dish');
  return response.data;
};

export const getRootCauseAnalysis = async () => {
  const response = await api.get('/waste/analytics/root-cause');
  return response.data;
};