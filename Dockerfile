FROM node:18-bullseye-slim

# 1. Install LibreOffice
RUN apt-get update && apt-get install -y \
    libreoffice \
    fonts-liberation \
    fontconfig \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm install

# 2. Copie du code source
COPY src ./src

# 3. Création du dossier pour les fichiers (vide pour l'instant)
RUN mkdir files

# 4. Compilation (C'est ICI que Docker crée le dist tout seul)
RUN npx tsc

CMD ["node", "dist/index.js"]