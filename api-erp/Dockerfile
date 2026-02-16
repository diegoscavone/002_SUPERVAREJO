# Estágio 1: Instalar dependências
FROM node:lts-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

# Estágio 2: Criar a imagem de produção
FROM node:lts-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY . .

EXPOSE 3334

CMD ["npm", "start"]