import api from './axios';

export interface ProcurementOrder {
  id: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  status: string;
  supplier?: string;
}

export const getOrders = async (): Promise<ProcurementOrder[]> => {
  const response = await api.get('/procurement/orders');
  return response.data;
};

export const createOrder = async (data: { ingredientId: string; quantity: number; supplier?: string }) => {
  const response = await api.post('/procurement/orders', data);
  return response.data;
};

export const updateOrderStatus = async (id: string, status: string) => {
  const response = await api.patch(`/procurement/orders/${id}/status`, { status });
  return response.data;
};

export const predictQuantity = async (ingredientId: string) => {
  const response = await api.post('/procurement/predict-quantity', { ingredientId });
  return response.data;
};

export const getLowStock = async () => {
  const response = await api.get('/procurement/low-stock');
  return response.data;
};