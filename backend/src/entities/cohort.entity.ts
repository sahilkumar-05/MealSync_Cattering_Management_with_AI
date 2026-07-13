import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('cohorts')
export class Cohort {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g. "Ward 4B" or "BSCS Year 2"

  @Column({ nullable: true })
  description: string;

  @Column()
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}