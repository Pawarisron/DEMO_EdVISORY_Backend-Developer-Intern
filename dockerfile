FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src          

RUN npm run build

FROM node:20

WORKDIR /app

COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist

COPY src/locales ./dist/locales

RUN npm install --omit=dev

CMD ["node", "dist/server.js"]
