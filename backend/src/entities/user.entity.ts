import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Tenant } from './tenant.entity';

export enum UserRole {
  CHEF = 'chef',
  DIETITIAN = 'dietitian',
  PROCUREMENT_OFFICER = 'procurement_officer',
  ADMIN = 'admin',
  NURSE = 'nurse',
  STUDENT = 'student',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string; // hum kabhi bhi plain password save nahi karte

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @ManyToOne(() => Tenant, (tenant) => tenant.users)
  tenant: Tenant;

  @Column()
  tenantId: string; // isse directly filter karna easy hota hai

  @CreateDateColumn()
  createdAt: Date;
}