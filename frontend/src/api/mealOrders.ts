import api from './axios';

export interface MealOrder {
  id: string;
  dishName: string;
  serviceDate: string;
  cohortId: string;
  dinerName?: string;
  quantity: number;
  status: string;
}

export const getMealOrders = async (serviceDate?: string): Promise<MealOrder[]> => {
  const response = await api.get('/meal-orders', {
    params: serviceDate ? { serviceDate } : {},
  });
  return response.data;
};

export const placeStudentOrder = async (data: {
  menuItemId: string;
  serviceDate: string;
  cohortId: string;
  dinerName?: string;
}) => {
  const response = await api.post('/meal-orders/student', data);
  return response.data;
};

export const placeWardOrder = async (data: {
  menuItemId: string;
  serviceDate: string;
  cohortId: string;
  dinerName?: string;
  quantity: number;
}) => {
  const response = await api.post('/meal-orders/ward', data);
  return response.data;
};

export const cancelMealOrder = async (id: string) => {
  const response = await api.patch(`/meal-orders/${id}/cancel`, {});
  return response.data;
};

export const finalizeOrders = async (serviceDate: string) => {
  const response = await api.post('/meal-orders/finalize', { serviceDate });
  return response.data;
};