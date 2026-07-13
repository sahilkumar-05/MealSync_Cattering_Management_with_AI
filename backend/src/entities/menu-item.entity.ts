import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Menu } from './menu.entity';

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
}

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Menu, (menu) => menu.items, { onDelete: 'CASCADE' })
  menu: Menu;

  @Column()
  menuId: string;

  @Column({ type: 'enum', enum: MealType })
  mealType: MealType;

  @Column({ type: 'int' })
  dayOfWeek: number; // 1 = Monday ... 7 = Sunday

  @Column()
  dishName: string;

  @Column({ type: 'jsonb', default: [] })
  ingredients: {
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  nutritionSummary: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };

  @Column()
  tenantId: string;
}