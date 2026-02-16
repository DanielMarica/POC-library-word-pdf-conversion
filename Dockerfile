# 1. Image de base : Node.js sur Debian (nécessaire pour LibreOffice)
FROM node:18-bullseye-slim

# 2. Installation de LibreOffice et des polices nécessaires
RUN apt-get update && apt-get install -y \
    libreoffice \
    fonts-liberation \
    fontconfig \
    && rm -rf /var/lib/apt/lists/*

# 3. Dossier de travail
WORKDIR /app

# 4. Copie des fichiers de configuration
COPY package*.json tsconfig.json ./

# 5. Installation des dépendances
RUN npm install

# 6. Copie du code source
COPY src ./src

# 7. Compilation du TypeScript vers JavaScript (dossier dist)
# On utilise npx tsc pour utiliser le compilateur local
RUN npx tsc

# 8. Commande de lancement (exécute le JS compilé)
CMD ["node", "dist/index.js"]