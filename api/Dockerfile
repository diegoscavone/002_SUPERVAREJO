# Estágio 1: Instalar dependências
FROM node:lts-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Evita baixar o Chromium do Puppeteer durante o install
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN npm install

# Estágio 2: Imagem de produção
FROM node:lts-alpine

# Variáveis para o Puppeteer encontrar o Chromium do Alpine
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Instalar Chromium e dependências de fontes (essencial para cartazes de mercado)
RUN apk add --no-cache \
    dumb-init \
    udev \
    ttf-freefont \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates

COPY --from=builder /app/node_modules ./node_modules
COPY . .

EXPOSE 3333

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["npm", "start"]