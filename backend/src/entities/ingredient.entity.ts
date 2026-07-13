import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g. "Chicken Breast"

  @Column()
  unit: string; // e.g. "kg", "g", "litre", "piece"

  @Column()
  category: string; // e.g. "Protein", "Vegetable", "Dairy"

  @Column({ type: 'jsonb', nullable: true })
  nutritionPer100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };

  @Column({ default: 0 })
  shelfLifeDays: number;

  @Column({ nullable: true })
  preferredSupplier: string;

  @Column({ type: 'float', default: 0 })
  stockLevel: number;

  @Column()
  tenantId: string; // har ingredient kis tenant ki hai

  @CreateDateColumn()
  createdAt: Date;
}