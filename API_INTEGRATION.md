# 🔌 Configuration API - TetsuBot

Tous les services externes et APIs utilisés par le bot.

## 📺 Jikan API (Anime/Manga Data)

**Site:** https://jikan.moe/v4
**Documentation:** https://docs.api.jikan.moe/

### Configuration .env
```env
JIKAN_API=https://api.jikan.moe/v4
JIKAN_ENABLED=true
JIKAN_TIMEOUT=10000
```

### Exemple d'Utilisation

```javascript
const axios = require('axios');
const config = require('./config');

async function getAnimeInfo(animeName) {
  try {
    const response = await axios.get(
      `${config.JIKAN_API}/anime?query=${animeName}&limit=1`,
      { timeout: config.JIKAN_TIMEOUT }
    );
    
    if (response.data.data.length === 0) {
      return null;
    }
    
    const anime = response.data.data[0];
    return {
      id: anime.mal_id,
      title: anime.title,
      synopsis: anime.synopsis,
      episodes: anime.episodes,
      rating: anime.rating,
      score: anime.score,
      status: anime.status,
      aired: anime.aired,
      studios: anime.studios,
      genres: anime.genres,
      image: anime.images.jpg.large_image_url
    };
  } catch (error) {
    console.error('Jikan API Error:', error.message);
    return null;
  }
}

module.exports = { getAnimeInfo };
```

---

## 🖼️ Waifu.pics API

**Site:** https://waifu.pics
**Documentation:** https://waifu.pics/

### Endpoints
```
GET /random/waifu    → Image waifu
GET /random/husbando → Image husbando
GET /random/neko     → Chat anime
GET /random/shinobu  → Shinobu
GET /random/mitsuri  → Mitsuri
```

### Exemple
```javascript
const axios = require('axios');

async function getWaifuImage() {
  const response = await axios.get('https://api.waifu.pics/random/waifu');
  return response.data.url;
}
```

---

## 🎌 MyAnimeList API (Alternative)

**Site:** https://myanimelist.net/apiconfig/references/api/v2
**Note:** Nécessite authentification OAuth2

### Configuration
```env
MAL_CLIENT_ID=your_client_id
MAL_CLIENT_SECRET=your_client_secret
```

### Setup
1. Allez sur https://myanimelist.net/apiconfig/references/api/v2
2. Créez une nouvelle application
3. Obtenez Client ID & Secret
4. Mettez à jour .env

---

## 📷 Imgflip API (Memes)

**Site:** https://imgflip.com/api
**Documentation:** https://imgflip.com/api

### Configuration .env
```env
IMGFLIP_USERNAME=your_username
IMGFLIP_PASSWORD=your_password
```

### Exemple
```javascript
const axios = require('axios');

async function createMeme(templateId, text0, text1) {
  const response = await axios.post('https://api.imgflip.com/caption_image', null, {
    params: {
      template_id: templateId,
      text0: text0,
      text1: text1,
      username: process.env.IMGFLIP_USERNAME,
      password: process.env.IMGFLIP_PASSWORD
    }
  });
  
  return response.data.data.url;
}
```

---

## 📊 REST Countries API (Info pays)

**Site:** https://restcountries.com
**Documentation:** Gratuit, pas d'authentification

### Exemple
```javascript
async function getCountryInfo(countryName) {
  const response = await axios.get(
    `https://restcountries.com/v3.1/name/${countryName}`
  );
  return response.data[0];
}
```

---

## 🎵 Spotify API (Musique anime)

**Site:** https://developer.spotify.com
**Documentation:** https://developer.spotify.com/documentation/web-api

### Configuration .env
```env
SPOTIFY_CLIENT_ID=your_id
SPOTIFY_CLIENT_SECRET=your_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

### Setup
1. Créez une app sur https://developer.spotify.com/dashboard
2. Obtenez les credentials
3. Mettez à jour .env

---

## 🎮 Discord Webhook (Notifications)

**Pour:** Notifier un serveur Discord des événements du bot

### Configuration .env
```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

### Exemple
```javascript
const axios = require('axios');

async function sendDiscordNotification(message, color = 0x00ff00) {
  const embed = {
    title: "TetsuBot Notification",
    description: message,
    color: color,
    timestamp: new Date()
  };
  
  await axios.post(process.env.DISCORD_WEBHOOK_URL, {
    embeds: [embed]
  });
}
```

---

## 📨 Telegram Bot (Backup)

**Pour:** Recevoir les logs en Telegram

### Configuration .env
```env
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_CHAT_ID=your_chat_id
```

### Exemple
```javascript
const axios = require('axios');

async function sendTelegramLog(message) {
  await axios.get(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      params: {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message
      }
    }
  );
}
```

---

## 🔐 Firebase (Authentication)

**Pour:** Authentification utilisateurs

### Configuration
```env
FIREBASE_API_KEY=your_key
FIREBASE_AUTH_DOMAIN=your_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

---

## 💳 Stripe (Paiements)

**Pour:** Système de paiements premium

### Configuration .env
```env
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Exemple
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createPaymentIntent(amount) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: 'eur',
    payment_method_types: ['card']
  });
  
  return paymentIntent.client_secret;
}
```

---

## 📊 Sentry (Error Tracking)

**Pour:** Tracker les erreurs en production

### Configuration .env
```env
SENTRY_DSN=https://your_dsn@sentry.io/...
```

### Setup
```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

---

## 📈 Analytics (Google Analytics / Mixpanel)

**Pour:** Tracker les événements utilisateurs

### Configuration .env
```env
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
MIXPANEL_TOKEN=your_token
```

---

## ☁️ AWS S3 (Storage)

**Pour:** Sauvegarder les fichiers/images

### Configuration .env
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=eu-west-1
AWS_S3_BUCKET=tetsubot-bucket
```

### Exemple
```javascript
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function uploadFile(fileName, fileContent) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName,
    Body: fileContent
  };
  
  return s3.upload(params).promise();
}
```

---

## 📱 SendGrid (Email)

**Pour:** Envoyer des emails

### Configuration .env
```env
SENDGRID_API_KEY=your_api_key
SENDGRID_FROM_EMAIL=noreply@tetsubot.com
```

---

## 🎯 Résumé des APIs Recommandées

| API | Priorité | Use Case |
|-----|----------|----------|
| Jikan | ⭐⭐⭐⭐⭐ | Anime/Manga data |
| Waifu.pics | ⭐⭐⭐⭐⭐ | Images |
| Discord Webhook | ⭐⭐⭐⭐ | Notifications |
| Stripe | ⭐⭐⭐⭐ | Paiements |
| Sentry | ⭐⭐⭐⭐ | Error tracking |
| Firebase | ⭐⭐⭐ | Auth |
| AWS S3 | ⭐⭐⭐ | Storage |
| Telegram | ⭐⭐ | Logs |
| SendGrid | ⭐⭐ | Email |

---

## 🔗 Ressources Utiles

- **Postman** - Tester les APIs: https://www.postman.com/
- **Swagger UI** - Documenter: https://swagger.io/
- **RapidAPI** - Trouver des APIs: https://rapidapi.com/
- **OpenWeather** - Météo: https://openweathermap.org/api

---

**Pour activer une API:**
1. Créer un compte sur le service
2. Obtenir les credentials
3. Ajouter à .env
4. Installer le package npm
5. Intégrer dans le bot

**Bon développement! 🚀**
