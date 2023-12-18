import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { User } from "modules/users/entities/user.entity";

@Entity()
export class Farm {
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Column()
  public address: string;

  @Column({
    type: "point",
    transformer: {
      to(value: string): string {
        const [latitude, longitude] = value.split(",").map(Number);
        return `(${latitude}, ${longitude})`;
      },
      from(value: { x: number; y: number }): string {
        return `${value.x},${value.y}`;
      },
    },
  })
  public coordinates: string;

  @Column()
  @Index()
  public name: string;

  @Column({ type: "float" })
  public size: number;

  @Column({ type: "uuid" })
  public userId: string;

  @Column({ type: "float" })
  @Index()
  public yield: number;

  @CreateDateColumn()
  @Index()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @ManyToOne(() => User, user => user.farms, { onDelete: "CASCADE" })
  public user: User;
}
