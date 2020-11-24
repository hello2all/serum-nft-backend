import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { IsNotEmpty, IsBoolean } from "class-validator";

@Entity()
export class Market {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsNotEmpty()
  address: string;

  @Column()
  @IsNotEmpty()
  programId: string;

  @Column()
  @IsBoolean()
  deprecated: boolean;
}
