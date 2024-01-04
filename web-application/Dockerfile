# Dockerfile
FROM node:18-alpine

WORKDIR /usr/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

EXPOSE 3000

CMD [ "yarn", "start" ]