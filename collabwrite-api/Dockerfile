FROM node:24-alpine

RUN apk add --no-cache wget

WORKDIR /app

COPY package.json package-lock.json ./
COPY tsconfig.json ./

RUN npm install

COPY src ./src
COPY server.ts ./

# Compiler TypeScript
RUN npx tsc

CMD ["node", "server.js"]