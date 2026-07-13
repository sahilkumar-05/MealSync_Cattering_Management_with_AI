import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: 'standard' })
  nutritionalStandard: string;

  @Column({ nullable: true })
  emailDomain: string; // e.g. "westgate.edu", "citygeneral.com"

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];
}