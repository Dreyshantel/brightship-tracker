FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev \
    && rm -rf /usr/local/lib/node_modules/npm \
              /usr/local/bin/npm \
              /usr/local/bin/npx \
    && apk upgrade --no-cache

COPY src ./src

EXPOSE 3000

CMD ["node", "src/worker.js"]
