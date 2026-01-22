const { useMultiFileAuthState, generateLoginCodeQRString } = require('@whiskeysockets/baileys');
const fs = require('fs');
const qrcode = require('qrcode-terminal');

async function testQRGeneration() {
  console.log('🧪 Test de génération QR - Approche alternative\n');

  const SESSION_DIR = './test_qr_session';
  
  // Nettoyer
  if (fs.existsSync(SESSION_DIR)) {
    fs.rmSync(SESSION_DIR, { recursive: true });
  }
  fs.mkdirSync(SESSION_DIR, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);

  console.log('✓ État d\'authentification chargé');
  console.log('✓ Dossier session créé: ' + SESSION_DIR);
  
  // Chercher si une fonction de génération QR existe
  console.log('\nFonctions disponibles dans Baileys:');
  const baileys = require('@whiskeysockets/baileys');
  
  Object.keys(baileys).forEach(key => {
    if (key.toLowerCase().includes('qr') || key.toLowerCase().includes('code') || key.toLowerCase().includes('pairing')) {
      console.log('  - ' + key);
    }
  });

  console.log('\n✓ Pour générer le QR, on doit se connecter avec makeWASocket');
  console.log('✓ Le QR sera reçu via l\'événement connection.update');
}

testQRGeneration().catch(err => {
  console.error('Erreur:', err.message);
});
