const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');
const fs = require('fs');

async function testConnection() {
  console.log('🧪 Test de connexion Baileys\n');
  
  const SESSION_DIR = './whatsapp_auth_test';
  
  // Nettoyer la session de test
  if (fs.existsSync(SESSION_DIR)) {
    fs.rmSync(SESSION_DIR, { recursive: true });
  }
  fs.mkdirSync(SESSION_DIR, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);

  console.log('📝 Configuration:');
  console.log('   Browser: TetsuBot / Chrome / 120.0.0.0');
  console.log('   Session Dir: ' + SESSION_DIR);
  console.log('   Max Wait: 120 secondes\n');

  const sock = makeWASocket({
    auth: state,
    logger: require('pino')({ level: 'silent' }),
    browser: ['TetsuBot', 'Chrome', '120.0.0.0'],
    syncFullHistory: false,
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    pairingCodeTimeoutMs: 120000,
    maxMsToWaitForConnection: 120000,
    retryRequestDelayMs: 5000,
    keepAliveIntervalMs: 30000,
  });

  sock.ev.on('creds.update', saveCreds);

  let eventCount = 0;

  sock.ev.on('connection.update', (update) => {
    eventCount++;
    console.log(`\n[Événement ${eventCount}] connection.update:`);
    
    if (update.connection) console.log('  ✓ connection:', update.connection);
    if (update.qr) console.log('  ✓ qr: GÉNÉRÉ');
    if (update.pairingCode) console.log('  ✓ pairingCode:', update.pairingCode);
    if (update.lastDisconnect) {
      const statusCode = update.lastDisconnect.error?.output?.statusCode;
      const message = update.lastDisconnect.error?.message;
      console.log('  ✓ lastDisconnect:');
      console.log('     - statusCode:', statusCode);
      console.log('     - message:', message);
    }
    if (update.isNewLogin) console.log('  ✓ isNewLogin:', update.isNewLogin);
    if (update.receivedPendingNotifications) console.log('  ✓ receivedPendingNotifications:', update.receivedPendingNotifications);
    
    // Afficher le QR si généré
    if (update.qr) {
      const qrcode = require('qrcode-terminal');
      console.log('\n═══════════════════════════════════════');
      console.log('📱 QR CODE GÉNÉRÉ - Scannez avec WhatsApp');
      console.log('═══════════════════════════════════════\n');
      try {
        qrcode.generate(update.qr, { small: true });
      } catch (err) {
        console.log('QR (base64):', update.qr.substring(0, 50) + '...');
      }
      console.log('\nÉtapes:');
      console.log('1. Ouvrez WhatsApp sur votre téléphone');
      console.log('2. Menu > Paramètres > Appareils liés > Nouvel appareil');
      console.log('3. Scannez le QR code ci-dessus');
      console.log('⏱️  Délai: 120 secondes\n');
    }

    // Statut final
    if (update.connection === 'open') {
      console.log('\n✅ SUCCÈS! Le bot est connecté!\n');
      process.exit(0);
    }
    
    if (update.connection === 'close') {
      const statusCode = update.lastDisconnect?.error?.output?.statusCode;
      if (statusCode === 405) {
        console.log('\n❌ ERREUR 405: WhatsApp a refusé la connexion');
        console.log('This number is BLOCKED by WhatsApp servers');
        console.log('\n⏸️  Arrêt du test\n');
        process.exit(1);
      }
    }
  });

  // Timeout après 30 secondes
  setTimeout(() => {
    console.log('\n⏱️  Timeout - aucun événement');
    process.exit(1);
  }, 30000);
}

testConnection().catch(err => {
  console.error('❌ Erreur:', err.message);
  process.exit(1);
});
