import api from './axios';

export interface Allergy {
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface DietaryProfile {
  id: string;
  dinerName: string;
  cohortId: string;
  allergies: Allergy[];
  religiousRequirements: string[];
  preferences: string[];
}

export const getDietaryProfiles = async (cohortId?: string): Promise<DietaryProfile[]> => {
  const response = await api.get('/dietary-profiles', {
    params: cohortId ? { cohortId } : {},
  });
  return response.data;
};

export const createDietaryProfile = async (data: Partial<DietaryProfile>) => {
  const response = await api.post('/dietary-profiles', data);
  return response.data;
};

export const deleteDietaryProfile = async (id: string) => {
  const response = await api.delete(`/dietary-profiles/${id}`);
  return response.data;
};