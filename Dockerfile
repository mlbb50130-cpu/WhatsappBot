FROM node:20-alpine

WORKDIR /app

# Installer git (nécessaire pour npm)
RUN apk add --no-cache git

# Copier les fichiers
COPY package*.json ./

# Installer les dépendances
RUN npm install --omit=dev

# Copier le reste du code (tous les fichiers)
COPY src ./src
COPY public ./public
COPY .env* ./

# Créer les dossiers nécessaires
RUN mkdir -p logs sessions whatsapp_auth

# Expose le port
EXPOSE 3000

# Lancer l'application
CMD ["node", "src/index.js"]
