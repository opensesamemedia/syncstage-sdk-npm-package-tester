# Dockerfile
FROM node:18-alpine

WORKDIR /usr/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

EXPOSE 3000

RUN echo "REACT_APP_BACKEND_BASE_PATH=http://localhost:3000/api" > .env

CMD [ "yarn", "start" ]