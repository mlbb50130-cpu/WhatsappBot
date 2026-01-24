FROM node:20-alpine

WORKDIR /app

# Installer git et Python (nécessaires pour npm et voiranime scraper)
RUN apk add --no-cache git python3 py3-pip

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances Node.js
RUN npm install --omit=dev --legacy-peer-deps

# Copier les scripts Python et requirements
COPY scripts/requirements.txt ./scripts/

# Installer les dépendances Python
RUN pip3 install --no-cache-dir --break-system-packages -r scripts/requirements.txt

# Copier TOUS les fichiers du projet
COPY . .

# Créer les dossiers nécessaires
RUN mkdir -p logs sessions whatsapp_auth

# Expose le port
EXPOSE 3000

# Lancer l'application
CMD ["node", "src/index.js"]
