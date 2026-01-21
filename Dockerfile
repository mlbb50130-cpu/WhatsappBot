FROM node:20-alpine

WORKDIR /app

# Copier les fichiers
COPY package*.json ./
COPY . .

# Installer les dépendances
RUN npm install --omit=dev

# Créer les dossiers nécessaires
RUN mkdir -p logs sessions whatsapp_auth

# Expose le port
EXPOSE 3000

# Lancer l'application
CMD ["node", "src/index.js"]
