import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum OrderStatus {
  PENDING = 'pending',
  ORDERED = 'ordered',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

@Entity('procurement_orders')
export class ProcurementOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ingredientId: string;

  @Column()
  ingredientName: string; // duplicate rakha hai easy display ke liye

  @Column({ type: 'float' })
  quantity: number;

  @Column()
  unit: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ nullable: true })
  supplier: string;

  @Column({ nullable: true })
  orderedByUserId: string;

  @Column()
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}