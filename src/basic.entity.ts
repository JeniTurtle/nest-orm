import * as shortid from 'shortid';
import {
  BeforeInsert,
  PrimaryColumn,
  CreateDateColumn,
  Column,
  UpdateDateColumn,
  VersionColumn,
  DeleteDateColumn,
} from 'typeorm';
import { IdColumn, CreateUserColumn, UpdateUserColumn } from './decorator';

export abstract class BasicEntity {
  @IdColumn()
  @PrimaryColumn({ type: String })
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @CreateUserColumn()
  @Column({ type: String })
  createdById: string;

  @UpdateDateColumn()
  updatedAt?: Date;

  @UpdateUserColumn()
  @Column({ type: String, nullable: true })
  updatedById?: string;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ type: String, nullable: true })
  deletedById?: string;

  @VersionColumn()
  version: number;

  getId() {
    return this.id || shortid.generate();
  }

  @BeforeInsert()
  setId() {
    this.id = this.getId();
  }
}
