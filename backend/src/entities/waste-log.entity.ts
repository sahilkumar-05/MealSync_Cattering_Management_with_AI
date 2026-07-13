import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('waste_logs')
export class WasteLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  menuItemId: string;

  @Column()
  dishName: string; // duplicate rakha hai display ke liye

  @Column({ type: 'date' })
  logDate: string;

  @Column({ type: 'float' })
  wastedKg: number;

  @Column({ nullable: true })
  loggedByUserId: string;

  @Column({ nullable: true })
  notes: string; // optional — kyun waste hua (chef likh sake)

  @Column()
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}