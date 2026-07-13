import api from './axios';

export interface Tenant {
  id: string;
  name: string;
  emailDomain?: string;
}

export const getTenants = async (): Promise<Tenant[]> => {
  const response = await api.get('/tenants');
  return response.data;
};