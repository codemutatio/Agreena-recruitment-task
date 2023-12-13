import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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
}
