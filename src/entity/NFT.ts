import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

enum NFT_Types {
  VIDEO = "VIDEO",
  IMAGE = "IMAGE",
  REDEEMABLE = "REDEEMABLE",
}

@Entity()
export class NFT {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  img: string;

  @Column()
  imgSmall: string;

  @Column()
  name: string;

  @Column()
  supply: number;

  @Column()
  mintAddress: string;

  @Column()
  marketAddress: string;

  @Column()
  redeemable: boolean;

  @Column()
  keywords: boolean;

  @Column({
    type: "enum",
    enum: NFT_Types,
    default: NFT_Types.IMAGE,
  })
  type: NFT_Types;

  @Column({ default: null, nullable: true })
  redeemAddress: string;
}
