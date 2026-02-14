FROM ghcr.io/puppeteer/puppeteer:latest

USER root

# Instala as dependências que faltam para o Chrome rodar no Railway
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libgbm-dev \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Comando para ligar
CMD ["node", "index.js"]
