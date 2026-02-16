# 1. On utilise Bookworm (Debian 12) plus stable pour les puces M4
FROM --platform=linux/amd64 node:18-bookworm-slim

# 2. On ajoute des options de robustesse pour apt-get
RUN apt-get update && \
    apt-get install -y --fix-missing --no-install-recommends \
    libreoffice \
    fonts-liberation \
    fontconfig && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm install

COPY src ./src
# On s'assure que le dossier uploads existe
RUN mkdir -p uploads && npx tsc

EXPOSE 4004

CMD ["node", "dist/index.js"]