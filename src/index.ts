import "reflect-metadata";
import { createConnection } from "typeorm";
import { NFT } from "./entity/NFT";
import * as express from "express";
import { Request, Response } from "express";

createConnection()
  .then(async (connection) => {
    const userRepository = connection.getRepository(NFT);

    const app = express();
    app.use(express.json());

    app.get("/", (req: Request, res: Response) => {
      res.send("Hello World!");
    });

    app.listen(8000);
  })
  .catch((error) => console.log(error));
