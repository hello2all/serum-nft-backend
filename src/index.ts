import { createConnection, getConnectionOptions, ILike, In } from "typeorm";
import { NFT, NFT_Types } from "./entity/NFT";
import { Market } from "./entity/Market";
import * as express from "express";
import { Request, Response } from "express";
import { validate } from "class-validator";
import * as passport from "passport";
import HeaderAPIKeyStrategy from "passport-headerapikey";
import { NFTPostReq, MarketPostReq } from "./interfaces";
import * as cors from "cors";

const NODE_ENV = process.env.NODE_ENV;
const API_KEY = process.env.API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const PORT = process.env.PORT || 5000;

const corsOptions: cors.CorsOptions = {
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "X-Access-Token",
    "Authorization",
  ],
};

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
  const env = NODE_ENV == "production" ? NODE_ENV : "development";
  const connectionOptions = await getConnectionOptions(env);
  return env == "production"
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
    const marketRepository = connection.getRepository(Market);

    const app = express();
    app.use(express.json());
    app.use(cors(corsOptions));

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
      condition.name = query.name ? ILike("%" + query.name + "%") : ILike("%");
      if (query.mintAddress) {
        condition.mintAddress = Array.isArray(query.mintAddress)
          ? In(<string[]>query.mintAddress)
          : query.mintAddress;
      }
      if (query.marketAddress) {
        condition.marketAddress = Array.isArray(query.marketAddress)
          ? In(<string[]>query.marketAddress)
          : query.marketAddress;
      }
      if (query.redeemAddress) {
        condition.redeemAddress = Array.isArray(condition.redeemAddress)
          ? In(<string[]>query.redeemAddress)
          : query.redeemAddress;
      }
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

    app.post("/nft", async (req: Request, res: Response) => {
      let nft = new NFT();
      let body: NFTPostReq = req.body;
      nft.name = body.name;
      nft.img = body.img;
      nft.imgSmall = body.img;
      nft.keywords = body.keywords;
      nft.marketAddress = body.marketAddress;
      nft.mintAddress = body.mintAddress;
      if (body.redeemable) {
        nft.redeemAddress = body.redeemAddress;
      }
      nft.redeemable = body.redeemable;
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
    });

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

    app.get("/market", async (req: Request, res: Response) => {
      let query = req.query;
      let condition: any = {};
      if (query.id) {
        condition.id = query.id;
      }
      let take = query.take ? query.take : 50;
      let skip = query.skip ? query.skip : 0;
      condition.name = query.name ? ILike("%" + query.name + "%") : ILike("%");
      if (query.address) {
        condition.address = Array.isArray(query.address)
          ? In(<string[]>query.address)
          : query.address;
      }
      if (query.programId) {
        condition.programId = Array.isArray(query.programId)
          ? In(<string[]>query.programId)
          : query.programId;
      }
      if (query.deprecated !== undefined) {
        condition.deprecated = query.deprecated;
      }

      try {
        const [result, total] = await marketRepository.findAndCount({
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

    app.post("/market", async (req: Request, res: Response) => {
      let market = new Market();
      let body: MarketPostReq = req.body;
      market.name = body.name;
      market.address = body.address;
      market.programId = body.programId;
      market.deprecated = body.deprecated;

      const errors = await validate(market);
      if (errors.length > 0) {
        res.sendStatus(400);
      } else {
        try {
          await marketRepository.save(market);
          res.send(JSON.stringify(market));
        } catch (error) {
          res.sendStatus(500);
        }
      }
    });

    app.listen(PORT);
  } catch (error) {
    console.log(error);
  }
};

createServer();
