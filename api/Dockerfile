# Estágio 1: Instalar dependências (NOMEADO COMO builder)
FROM node:lts-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Impede o download do Chromium interno do Puppeteer no install
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN npm install

# Estágio 2: Imagem final de execução
FROM node:lts-alpine

# Variáveis para o Puppeteer encontrar o Chromium do Alpine
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Instala o Chromium e bibliotecas necessárias no Alpine
RUN apk add --no-cache \
    dumb-init \
    udev \
    ttf-freefont \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates

# Copia os node_modules do estágio builder
COPY --from=builder /app/node_modules ./node_modules
COPY . .

EXPOSE 3333

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["npm", "start"]