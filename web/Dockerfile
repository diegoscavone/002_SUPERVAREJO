# Stage 1: Build application
FROM node:lts AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve the application with 'serve'
FROM node:lts-slim AS production-runner

WORKDIR /app

# Copie apenas os arquivos construídos do estágio de build
COPY --from=builder /app/dist ./dist

# Instale o pacote 'serve' globalmente para servir os arquivos estáticos
RUN npm install -g serve

EXPOSE 5173

# O comando para iniciar o servidor 'serve' na porta 5173, servindo a pasta 'dist'
CMD ["serve", "-s", "dist", "-l", "5173"]

