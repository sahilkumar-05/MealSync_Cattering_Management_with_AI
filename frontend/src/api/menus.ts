import api from './axios';
import type { Menu } from '../types';

export const getMenus = async (): Promise<Menu[]> => {
  const response = await api.get('/menus');
  return response.data;
};

export const generateMenu = async (data: {
  weekStarting: string;
  budgetPerMeal?: number;
  nutritionalStandard?: string;
  dietaryNotes?: string[];
}) => {
  const response = await api.post('/menus/generate', data);
  return response.data;
};

export const updateMenuStatus = async (id: string, status: string) => {
  const response = await api.patch(`/menus/${id}/status`, { status });
  return response.data;
};

export const checkAllergyConflict = async (menuItemId: string, cohortId: string) => {
  const response = await api.post('/menus/check-allergy-conflict', { menuItemId, cohortId });
  return response.data;
};

export const deleteMenu = async (id: string) => {
  const response = await api.delete(`/menus/${id}`);
  return response.data;
};