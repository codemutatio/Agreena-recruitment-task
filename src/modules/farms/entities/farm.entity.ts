import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { User } from "modules/users/entities/user.entity";

@Entity()
export class Farm {
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Column()
  public address: string;

  @Column({ type: "point" })
  public coordinates: string;

  @Column()
  public name: string;

  @Column({ type: "float" })
  public size: number;

  @Column({ type: "uuid" })
  public userId: string;

  @Column({ type: "float" })
  public yield: number;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @ManyToOne(() => User, user => user.farms, { onDelete: "CASCADE" })
  public user: User;
}
