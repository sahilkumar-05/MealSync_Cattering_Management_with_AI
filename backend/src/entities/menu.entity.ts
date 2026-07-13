import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { MenuItem } from './menu-item.entity';

export enum MenuStatus {
  DRAFT = 'draft',
  DIETITIAN_REVIEW = 'dietitian_review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
}

@Entity('menus')
export class Menu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  weekStarting: string; // e.g. "2026-07-13"

  @Column({ type: 'enum', enum: MenuStatus, default: MenuStatus.DRAFT })
  status: MenuStatus;

  @Column({ nullable: true })
  createdByUserId: string;

  @Column({ nullable: true })
  approvedByUserId: string;

  @OneToMany(() => MenuItem, (item) => item.menu, { cascade: true })
  items: MenuItem[];

  @Column()
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}