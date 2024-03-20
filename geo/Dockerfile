FROM node:18-slim

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . ./

ENV NODE_ENV=production

RUN yarn run build

CMD [ "node", "./dist/main.js" ]
