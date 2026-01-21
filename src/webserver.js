const express = require('express');
const path = require('path');

// Variables globales pour les statistiques
let botStats = {
    connected: false,
    users: 0,
    groups: 0,
    messages: 0,
    commands: 0,
    errors: 0,
    uptime: 0,
    startTime: Date.now()
};

// Créer le serveur Express
function createWebServer(port = 3000) {
    const app = express();

    // Middleware
    app.use(express.json());
    app.use(express.static(path.join(__dirname, '../public')));

    // Routes API
    app.get('/api/status', (req, res) => {
        botStats.uptime = Date.now() - botStats.startTime;
        res.json(botStats);
    });

    app.post('/api/stats', (req, res) => {
        const { key, value } = req.body;
        if (key && value !== undefined) {
            botStats[key] = value;
            res.json({ success: true, stats: botStats });
        } else {
            res.status(400).json({ error: 'Paramètres invalides' });
        }
    });

    // Route principale
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    // Démarrer le serveur
    app.listen(port, () => {
        console.log(`🌐 Serveur web lancé sur http://localhost:${port}`);
    });

    return app;
}

// Fonction pour mettre à jour les stats
function updateBotStats(stats) {
    Object.assign(botStats, stats);
}

// Fonction pour incrémenter les compteurs
function incrementStat(key, amount = 1) {
    if (botStats[key] !== undefined) {
        botStats[key] += amount;
    }
}

module.exports = {
    createWebServer,
    updateBotStats,
    incrementStat,
    botStats
};
