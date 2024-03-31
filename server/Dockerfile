FROM node:14

WORKDIR /user/src/app

COPY package.json ./

RUN npm install

COPY . .

RUN npm build

ENV NODE_ENV production

EXPOSE 8080

CMD ["node", "dist/index.js"]

USER node
