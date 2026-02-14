FROM ghcr.io/puppeteer/puppeteer:latest

USER root

# Instala dependências essenciais do sistema para o Chrome
RUN apt-get update && apt-get install -y \
    libgbm-dev \
    nss \
    fonts-liberation \
    libasound2 \
    libnspr4 \
    libnss3 \
    lsb-release \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Garante permissão na pasta de sessão
RUN mkdir -p /app/sessions && chmod -R 777 /app/sessions

CMD ["node", "index.js"]
