import { NFT_Types } from "./entity/NFT";

export interface NFTPostReq {
  img: string;
  name: string;
  supply: number;
  mintAddress: string;
  marketAddress: string;
  redeemable: boolean;
  keywords: string[];
  type: NFT_Types;
  imgSmall?: string;
  redeemAddress?: string;
}

export interface MarketPostReq {
  name: string;
  address: string;
  programId: string;
  deprecated: boolean;
}