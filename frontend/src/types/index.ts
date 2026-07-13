export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  category: string;
  stockLevel: number;
  shelfLifeDays?: number;
  preferredSupplier?: string;
}

export interface Menu {
  id: string;
  weekStarting: string;
  status: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  mealType: string;
  dayOfWeek: number;
  dishName: string;
  ingredients: any[];
}