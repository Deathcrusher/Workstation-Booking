FROM node:18-alpine

# Ensure Prisma can detect OpenSSL
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run build
RUN npm prune --omit=dev

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
