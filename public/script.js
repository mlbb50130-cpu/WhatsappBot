// Récupérer le statut du bot
async function updateStatus() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();

        // Mettre à jour le statut de connexion
        const statusElement = document.getElementById('connection-status');
        if (data.connected) {
            statusElement.textContent = '✅ Connecté';
            statusElement.style.color = '#00FF00';
        } else {
            statusElement.textContent = '❌ Déconnecté';
            statusElement.style.color = '#FF0000';
        }

        // Mettre à jour les compteurs
        document.getElementById('users-count').textContent = data.users || 0;
        document.getElementById('groups-count').textContent = data.groups || 0;
        document.getElementById('messages-count').textContent = data.messages || 0;
        document.getElementById('commands-count').textContent = data.commands || 0;
        document.getElementById('errors-count').textContent = data.errors || 0;

        // Mettre à jour l'uptime
        if (data.uptime) {
            document.getElementById('uptime').textContent = formatUptime(data.uptime);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du statut:', error);
        document.getElementById('connection-status').textContent = '⚠️ Erreur';
    }
}

// Formater l'uptime
function formatUptime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    let result = '';
    if (days > 0) result += `${days}j `;
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (seconds > 0) result += `${seconds}s`;

    return result || '0s';
}

// Mettre à jour le statut toutes les 5 secondes
document.addEventListener('DOMContentLoaded', () => {
    updateStatus();
    setInterval(updateStatus, 5000);

    // Navigation smooth
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
