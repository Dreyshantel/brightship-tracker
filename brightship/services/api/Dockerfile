FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install -g npm@10.9.9 && npm ci
COPY . .
EXPOSE 3000
CMD ["node", "src/index.js"]
