import api from './axios';
import type { Ingredient } from '../types';

export const getIngredients = async (): Promise<Ingredient[]> => {
  const response = await api.get('/ingredients');
  return response.data;
};

export const createIngredient = async (data: Partial<Ingredient>) => {
  const response = await api.post('/ingredients', data);
  return response.data;
};

export const updateIngredient = async (id: string, data: Partial<Ingredient>) => {
  const response = await api.put(`/ingredients/${id}`, data);
  return response.data;
};

export const deleteIngredient = async (id: string) => {
  const response = await api.delete(`/ingredients/${id}`);
  return response.data;
};