import { NFT_Types } from "./entity/NFT";

export interface NFTReq {
  img: string;
  name: string;
  supply: number;
  mintAddress: string;
  marketAddress: string;
  redeemable: boolean;
  keywords: string[];
  type: NFT_Types;
  redeemAddress?: string;
}
