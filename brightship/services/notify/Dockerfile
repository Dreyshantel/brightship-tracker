FROM node:22-alpine AS builder

RUN apk update && apk upgrade libcrypto3 libssl3

WORKDIR /app

COPY package*.json ./

RUN npm install -g npm@10.9.9 && npm ci

COPY src ./src


FROM node:22-alpine

RUN apk update && apk upgrade libcrypto3 libssl3

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src

CMD ["node", "src/index.js"]
