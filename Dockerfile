FROM --platform=linux/amd64 node:18-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

# INSTALLATION CRITIQUE : python3-uno est OBLIGATOIRE pour que unoserver fonctionne
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice-writer \
    libreoffice-java-common \
    python3-uno \
    python3-pip \
    netcat-openbsd \
    fonts-liberation \
    fontconfig \
    && pip3 install unoserver --break-system-packages \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm install --production=false

COPY src ./src
# Création explicite des dossiers
RUN mkdir -p files uploads && npx tsc && npm prune --production

COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 4004
CMD ["/start.sh"]