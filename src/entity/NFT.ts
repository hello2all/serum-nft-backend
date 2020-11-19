import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { IsNotEmpty, IsInt, IsUrl, IsBoolean, IsArray, IsEnum } from "class-validator";

export enum NFT_Types {
  VIDEO = "VIDEO",
  IMAGE = "IMAGE",
  REDEEMABLE = "REDEEMABLE",
}

@Entity()
export class NFT {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsUrl()
  img: string;

  @Column({ default: null, nullable: true })
  @IsUrl()
  imgSmall: string;

  @Column()
  @IsInt()
  supply: number;

  @Column()
  @IsNotEmpty()
  mintAddress: string;

  @Column()
  @IsNotEmpty()
  marketAddress: string;

  @Column()
  @IsBoolean()
  redeemable: boolean;

  @Column("simple-array")
  @IsArray()
  keywords: string[];

  @Column({
    type: "enum",
    enum: NFT_Types,
    default: NFT_Types.IMAGE,
  })
  @IsEnum(NFT_Types)
  type: NFT_Types;

  @Column({ default: null, nullable: true })
  @IsBoolean()
  redeemAddress: string;
}
