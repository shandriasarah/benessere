# 1. Usa uma imagem leve do Node
FROM node:18-alpine

# 2. Cria o diretório de trabalho dentro do container
WORKDIR /app

# 3. Copia os arquivos de configuração primeiro (para agilizar o build)
# O * garante que ele pegue o package-lock.json se existir
COPY package*.json ./

# 4. Instala as dependências (ignora as que já estão no seu PC e instala as do Linux)
RUN npm install --production

# 5. Copia TODO o restante dos arquivos da sua pasta para o container
COPY . .

# 6. EXPOSE: Avisa ao Render que a porta 3000 é a que ele deve vigiar
EXPOSE 3000

# 7. Comando de inicialização forçando o caminho relativo
# Se o seu arquivo principal for server.js, ele vai rodar!
CMD ["node", "server.js"]