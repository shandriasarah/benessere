FROM node:18
WORKDIR /app
# Note que aqui ele vai copiar o package.json da mesma pasta onde ele está
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]