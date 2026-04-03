FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
COPY tests ./tests

RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]
