FROM node:22-alpine
RUN apk update && apk upgrade libcrypto3 libssl3
WORKDIR /app
COPY package*.json ./
RUN npm install -g npm@10.9.9 && npm ci
COPY . .
EXPOSE 3000
CMD ["node", "src/index.js"]
