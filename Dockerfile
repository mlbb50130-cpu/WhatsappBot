FROM node:20-alpine

WORKDIR /app

# Installer git (nécessaire pour npm)
RUN apk add --no-cache git

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install --omit=dev --legacy-peer-deps

# Copier TOUS les fichiers du projet
COPY . .

# Créer les dossiers nécessaires
RUN mkdir -p logs sessions whatsapp_auth

# Expose le port
EXPOSE 3000

# Lancer l'application
CMD ["node", "src/index.js"]
