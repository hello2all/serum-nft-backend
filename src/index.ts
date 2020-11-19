import { Any, createConnection, getConnectionOptions, Like } from "typeorm";
import { NFT, NFT_Types } from "./entity/NFT";
import * as express from "express";
import { Request, Response } from "express";
import { validate } from "class-validator";
import * as passport from "passport";
import HeaderAPIKeyStrategy from "passport-headerapikey";
import { NFTReq } from "./interfaces";

const ENV = process.env.ENV;
const API_KEY = process.env.API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

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

const createTypeormConn = async () => {
  const env = ENV == "production" ? ENV : "development";
  const connectionOptions = await getConnectionOptions(env);
  return ENV == "production"
    ? createConnection({
        ...connectionOptions,
        url: DATABASE_URL,
        name: env,
      } as any)
    : createConnection({
        ...connectionOptions,
        name: env,
      } as any);
};

const createServer = async () => {
  const connection = await createTypeormConn();

  try {
    const nftRepository = connection.getRepository(NFT);

    const app = express();
    app.use(express.json());

    app.get("/", async (req: Request, res: Response) => {
      res.send("Solible API");
    });

    app.get("/unauthorized", async (req: Request, res: Response) => {
      res.sendStatus(401);
    });

    app.get("/nft", async (req: Request, res: Response) => {
      let query = req.query;
      let condition: any = {};
      if (query.id) {
        condition.id = query.id;
      }
      let take = query.take ? query.take : 50;
      let skip = query.skip ? query.skip : 0;
      condition.name = query.name ? Like("%" + query.name + "%") : Like("%");
      condition.mintAddress = query.mintAddress
        ? Like("%" + query.mintAddress + "%")
        : Like("%");
      condition.marketAddress = query.marketAddress
        ? Like("%" + query.marketAddress + "%")
        : Like("%");
      condition.redeemAddress = query.redeemAddress
        ? Like("%" + query.redeemAddress + "%")
        : Like("%");
      if (query.type) {
        condition.type = NFT_Types[query.type.toString()];
      }

      try {
        const [result, total] = await nftRepository.findAndCount({
          where: condition,
          take: take,
          skip: skip,
          order: { id: "DSEC" },
        } as any);

        res.send(JSON.stringify(result));
      } catch (error) {
        res.send([]);
      }
    });

    app.post(
      "/nft",
      passport.authenticate("headerapikey", {
        session: false,
        failureRedirect: "/unauthorized",
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
      "/nft",
      passport.authenticate("headerapikey", {
        session: false,
        failureRedirect: "/unauthorized",
      }),
      async (req: Request, res: Response) => {
        let body = req.body;
        let id = body.id || 0;
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
  } catch (error) {
    console.log(error);
  }
};

createServer();
