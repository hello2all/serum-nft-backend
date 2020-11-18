import "reflect-metadata";
import { createConnection } from "typeorm";
import { NFT, NFT_Types } from "./entity/NFT";
import * as express from "express";
import { Request, Response } from "express";
import { NFTReq } from "./interfaces";

createConnection()
  .then(async (connection) => {
    const nftRepository = connection.getRepository(NFT);

    const app = express();
    app.use(express.json());

    app.get("/", (req: Request, res: Response) => {
      let nft = new NFT();
      nft.name = 'nft';
      nft.img = 'test';
      nft.keywords = ['test1', 'test2'];
      nft.marketAddress = 'marketaddress';
      nft.mintAddress = 'mintaddr';
      nft.redeemAddress = 'redeemaddr';
      nft.redeemable = false;
      nft.supply = 1;
      nft.type = NFT_Types['IMAGE'];

      // res.send("Solible backend");
      res.send(JSON.stringify(nft));
    });

    app.post("/nft", async (req: Request, res: Response) => {
      let nft = new NFT();
      let body: NFTReq = req.body;
      nft.name = body.name;
      nft.img = body.img;
      nft.keywords = body.keywords;
      nft.marketAddress = body.marketAddress;
      nft.mintAddress = body.mintAddress;
      if (body.redeemable) {
        nft.redeemAddress = body.redeemAddress;
        nft.redeemable = body.redeemable;
      }
      nft.supply = body.supply;
      nft.type = NFT_Types[body.type];

      await nftRepository.save(nft);
      res.send(JSON.stringify(nft));
    });

    app.listen(8000);
  })
  .catch((error) => console.log(error));
