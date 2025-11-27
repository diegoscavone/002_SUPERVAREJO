# Stage 1: Install dependencies
FROM node:lts AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

# Stage 2: Run the application
FROM node:lts-slim AS production-runner

WORKDIR /app

# Copie apenas as dependências de produção
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copie o código da aplicação
COPY . .

EXPOSE 3334

# Comando para iniciar o servidor API em produção
# Assumimos que src/server.js é o entry point principal.
# Se você tiver um script 'start' no package.json que seja otimizado para produção, use CMD ["npm", "run", "start"]
CMD ["node", "src/server.js"]
