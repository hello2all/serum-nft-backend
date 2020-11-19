FROM node:14

WORKDIR /serum-nft-backend

COPY . .

RUN yarn install --production
RUN yarn global add typescript
RUN yarn build

ENV NODE_ENV production

EXPOSE 5000

CMD ["node", "build/index.js"]
USER node