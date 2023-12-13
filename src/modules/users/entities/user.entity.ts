import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { Farm } from "modules/farms/entities/farm.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Column({ nullable: true })
  public address: string;

  @Column({ type: "point", nullable: true })
  public coordinates: string;

  @Column({ unique: true })
  public email: string;

  @Column()
  public hashedPassword: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @OneToMany(() => Farm, farm => farm.user, { cascade: true })
  public farms: Farm[];
}
