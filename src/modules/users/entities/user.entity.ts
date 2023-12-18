import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { Farm } from "modules/farms/entities/farm.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Column({ nullable: true })
  public address: string;

  @Column({
    type: "point",
    nullable: true,
    transformer: {
      to(value: string): string | null {
        if(!value) return null;
        const [latitude, longitude] = value.split(",").map(Number);
        return `(${latitude}, ${longitude})`;
      },
      from(value: { x: number; y: number }): string | null {
        if (!value) return null;
        return `${value.x},${value.y}`;
      },
    },
  })
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
