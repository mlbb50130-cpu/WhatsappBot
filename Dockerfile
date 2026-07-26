FROM node:20-alpine

WORKDIR /app

# Installer git et Python (nécessaires pour npm et voiranime scraper)
RUN apk add --no-cache git python3 py3-pip bubblewrap

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances Node.js
RUN npm install --omit=dev --legacy-peer-deps

# Installer le CLI Claude Code (necessaire pour la commande !claude)
RUN npm install -g @anthropic-ai/claude-code

# Copier les scripts Python et requirements
COPY scripts/requirements.txt ./scripts/

# Installer les dépendances Python
RUN pip3 install --no-cache-dir --break-system-packages -r scripts/requirements.txt

# Copier TOUS les fichiers du projet
COPY . .

# Créer les dossiers nécessaires. ia_outputs recoit des droits larges: si la
# plateforme lance le conteneur sous un utilisateur non-root, l'ecriture y
# reste possible (a defaut, le code se replie sur /tmp).
RUN mkdir -p logs sessions whatsapp_auth ia_outputs \
    && chmod -R 777 logs sessions whatsapp_auth ia_outputs

# Expose le port
EXPOSE 3000

# Lancer l'application
CMD ["node", "src/index.js"]
