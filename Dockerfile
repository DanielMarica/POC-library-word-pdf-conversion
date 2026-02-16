FROM node:18-bullseye-slim

RUN apt-get update && apt-get install -y \
    libreoffice \
    fonts-liberation \
    fontconfig \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm install

COPY src ./src
# Création du dossier uploads
RUN mkdir uploads && npx tsc

# On expose le port 4004
EXPOSE 4004

CMD ["node", "dist/index.js"]