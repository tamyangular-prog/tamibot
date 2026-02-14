FROM ghcr.io/puppeteer/puppeteer:latest

USER root

# Instala bibliotecas vitais para o WhatsApp Web rodar no Railway
RUN apt-get update && apt-get install -y \
    libgbm1 \
    libnss3 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Permissões para não dar erro de pasta
RUN mkdir -p /app/sessions && chmod -R 777 /app/sessions

CMD ["node", "index.js"]
