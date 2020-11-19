FROM node:14

WORKDIR /serum-nft-backend

COPY . .

RUN npm i -g yarn
RUN yarn install --production
RUN yarn build

ENV NODE_ENV production

EXPOSE 5000

CMD ["node", "build/index.js"]
USER node