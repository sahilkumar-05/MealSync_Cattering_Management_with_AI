import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum AllergySeverity {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe', // anaphylactic
}

@Entity('dietary_profiles')
export class DietaryProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  dinerName: string; // patient ya student ka naam

  @Column({ nullable: true })
  cohortId: string; // kaunse ward/year se belong karta hai

  @Column({ type: 'jsonb', default: [] })
  allergies: {
    allergen: string;
    severity: AllergySeverity;
  }[];

  @Column({ type: 'jsonb', default: [] })
  religiousRequirements: string[]; // e.g. ["halal", "no beef"]

  @Column({ type: 'jsonb', default: [] })
  preferences: string[]; // e.g. ["vegetarian", "no onions"]

  @Column()
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}