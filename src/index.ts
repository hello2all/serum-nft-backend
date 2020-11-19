import { createConnection } from "typeorm";
import { NFT, NFT_Types } from "./entity/NFT";
import * as express from "express";
import { Request, Response } from "express";
import { validate } from "class-validator";
import * as passport from "passport";
import HeaderAPIKeyStrategy from "passport-headerapikey";
import { NFTReq } from "./interfaces";

const API_KEY = process.env.API_KEY;

passport.use(
  new HeaderAPIKeyStrategy(
    { header: "Authorization", prefix: "Api-Key " },
    false,
    (apikey, done) => {
      if (apikey === API_KEY) {
        return done(null, true);
      } else {
        return done(null, false);
      }
    }
  )
);

createConnection()
  .then(async (connection) => {
    const nftRepository = connection.getRepository(NFT);

    const app = express();
    app.use(express.json());

    app.get("/", async (req: Request, res: Response) => {
      res.send('Solible API');
    });

    app.get("/api/unauthorized", async (req: Request, res: Response) => {
      res.sendStatus(401);
    });

    app.post(
      "/api/nft",
      passport.authenticate("headerapikey", {
        session: false,
        failureRedirect: "/api/unauthorized",
      }),
      async (req: Request, res: Response) => {
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

        const errors = await validate(nft);
        if (errors.length > 0) {
          res.sendStatus(400);
        } else {
          try {
            await nftRepository.save(nft);
            res.send(JSON.stringify(nft));
          } catch (error) {
            res.sendStatus(500);
          }
        }
      }
    );

    app.put(
      "/api/nft",
      passport.authenticate("headerapikey", {
        session: false,
        failureRedirect: "/api/unauthorized",
      }),
      async (req: Request, res: Response) => {
        let body = req.body;
        let id = body.id;
        let imgSmall = body.imgSmall;

        let nft = await nftRepository.findOne({ id: id });
        if (nft === undefined) {
          res.sendStatus(400);
          return;
        }
        nft.imgSmall = imgSmall;
        const errors = await validate(nft);
        if (errors.length > 0) {
          res.sendStatus(400);
        } else {
          try {
            await nftRepository.save(nft);
            res.send(JSON.stringify(nft));
          } catch (error) {
            res.sendStatus(500);
          }
        }
      }
    );

    app.listen(8000);
  })
  .catch((error) => console.log(error));
