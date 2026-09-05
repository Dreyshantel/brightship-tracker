FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install -g npm@10.9.9 && npm ci
COPY src ./src
CMD ["node", "src/index.js"]
