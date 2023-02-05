FROM node:16.19.0-alpine
WORKDIR /usr/app
COPY package.json .
COPY index.js .
RUN npm install