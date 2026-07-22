const express = require('express');
const path = require('path');
const InstanceManager = require('./utils/instanceManager');

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

    // CORS (l'app Flutter appelle l'API depuis un autre origine)
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, x-api-token');
        if (req.method === 'OPTIONS') return res.sendStatus(204);
        next();
    });

    app.use(express.static(path.join(__dirname, '../public')));
    app.use('/assets', express.static(path.join(__dirname, './asset')));

    // Fichiers generes par l'IA (HTML, code, etc.) — accessibles via /files/<nom>
    const IA_OUTPUT_DIR = path.join(process.cwd(), 'ia_outputs');
    require('fs').mkdirSync(IA_OUTPUT_DIR, { recursive: true });
    app.use('/files', express.static(IA_OUTPUT_DIR));

    // Auth optionnelle par token sur les routes d'instances.
    const apiToken = process.env.API_TOKEN || '';
    const requireToken = (req, res, next) => {
        if (!apiToken) return next(); // pas de token configure -> ouvert
        if (req.header('x-api-token') === apiToken) return next();
        return res.status(401).json({ error: 'token invalide' });
    };

    // --- Statut general du bot ---
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

    // --- API instances (multi-tenant: liaison du WhatsApp d'un utilisateur) ---

    // Cree (ou recupere) une instance et renvoie le pairing code a saisir dans WhatsApp.
    app.post('/api/instances', requireToken, async (req, res) => {
        try {
            const { phone, prefix } = req.body || {};
            if (!phone) return res.status(400).json({ error: 'phone requis' });
            const state = await InstanceManager.createInstance(phone, prefix || '!');
            res.json(state);
        } catch (err) {
            res.status(500).json({ error: err.message || 'erreur' });
        }
    });

    // Etat d'une instance.
    app.get('/api/instances/:phone', requireToken, (req, res) => {
        const state = InstanceManager.getInstance(req.params.phone);
        if (!state) return res.status(404).json({ error: 'instance introuvable' });
        res.json(state);
    });

    // Definit le prefixe de l'instance.
    app.post('/api/instances/:phone/prefix', requireToken, (req, res) => {
        const { prefix } = req.body || {};
        const state = InstanceManager.setPrefix(req.params.phone, prefix || '!');
        if (!state) return res.status(404).json({ error: 'instance introuvable' });
        res.json(state);
    });

    // Delie / arrete une instance.
    app.delete('/api/instances/:phone', requireToken, async (req, res) => {
        const ok = await InstanceManager.removeInstance(req.params.phone);
        res.json({ success: ok });
    });

    // Route principale
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    app.listen(port, () => {
        console.log(`🌐 API en ecoute sur le port ${port}`);
    });

    return app;
}

function updateBotStats(stats) {
    Object.assign(botStats, stats);
}

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
