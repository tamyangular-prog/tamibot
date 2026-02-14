FROM ghcr.io/puppeteer/puppeteer:latest

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala as dependências (como root para evitar erro de permissão, depois volta pro user padrão se quiser, mas aqui simplificamos)
USER root
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta que o Express usa
EXPOSE 3000

# Comando para iniciar
CMD ["node", "index.js"]
