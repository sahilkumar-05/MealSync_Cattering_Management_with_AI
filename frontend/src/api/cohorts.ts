import api from './axios';

export interface Cohort {
  id: string;
  name: string;
  description?: string;
}

export const getCohorts = async (): Promise<Cohort[]> => {
  const response = await api.get('/cohorts');
  return response.data;
};

export const createCohort = async (data: { name: string; description?: string }) => {
  const response = await api.post('/cohorts', data);
  return response.data;
};

export const deleteCohortById = async (id: string) => {
  const response = await api.delete(`/cohorts/${id}`);
  return response.data;
};