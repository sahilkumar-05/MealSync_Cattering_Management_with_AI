import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum MealOrderStatus {
  PLACED = 'placed',
  FINALIZED = 'finalized', // cutoff ke baad lock ho jata hai
  CANCELLED = 'cancelled',
}

@Entity('meal_orders')
export class MealOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  menuItemId: string;

  @Column()
  dishName: string;

  @Column({ type: 'date' })
  serviceDate: string; // kis din khana serve hoga

  @Column()
  cohortId: string;

  @Column({ nullable: true })
  dinerName: string; // student ka naam, ya patient ka naam (hospital case mein)

  @Column({ type: 'int', default: 1 })
  quantity: number; // ek order mein kitne portions (nurse ek sath multiple bhi order kar sakti hai)

  @Column({ type: 'enum', enum: MealOrderStatus, default: MealOrderStatus.PLACED })
  status: MealOrderStatus;

  @Column()
  placedByUserId: string;

  @Column()
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}