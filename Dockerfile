FROM node:14.21.2-slim

WORKDIR /usr/src/app
COPY package*.json yarn.lock ./

RUN yarn --pure-lockfile

COPY . .

CMD [ "yarn", "start" ]
