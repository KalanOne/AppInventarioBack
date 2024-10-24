import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { User } from './user.entity'; // Asegúrate de importar User desde la ubicación correcta

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @VersionColumn()
  version: number;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedDate: Date;

  @BeforeInsert()
  @BeforeUpdate()
  unify() {
    this.name = this.name.toUpperCase();
  }
}
