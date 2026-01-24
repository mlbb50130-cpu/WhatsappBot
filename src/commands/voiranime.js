const axios = require('axios');
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

module.exports = {
  name: 'voiranime',
  description: 'Récupérer un épisode d\'un anime sur VoirAnime',
  category: 'FUN',
  usage: '!voiranime <nom> <épisode>',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const participantJid = message.key.participant || senderJid;
    const userJid = isGroup ? participantJid : senderJid;

    if (args.length < 2) {
      await sock.sendMessage(senderJid, {
        text: '❌ Utilisation: `!voiranime <nom> <épisode>`\n\n' +
              'Exemples:\n' +
              '`!voiranime naruto 1` → Naruto épisode 1\n' +
              '`!voiranime one piece 50` → One Piece épisode 50\n' +
              '`!voiranime jujutsu kaisen 5` → Jujutsu Kaisen épisode 5'
      });
      return;
    }

    // Parse arguments: last arg is episode number
    const episodeNum = parseInt(args[args.length - 1]);
    
    if (isNaN(episodeNum) || episodeNum <= 0) {
      await sock.sendMessage(senderJid, {
        text: '❌ Le dernier argument doit être un numéro d\'épisode!\n\nExemple: `!voiranime naruto 10`'
      });
      return;
    }

    // Everything before the last arg is the anime name
    const animeName = args.slice(0, -1).join(' ');

    try {
      await sock.sendMessage(senderJid, {
        text: `🔍 Recherche "${animeName}" épisode ${episodeNum}...\n⏳ Cela peut prendre quelques secondes`
      });

      // Call Python scraper
      const result = await this.callPythonScraper(animeName, episodeNum);

      if (!result.success) {
        let errorMsg = `❌ ${result.error}`;
        if (result.available) {
          errorMsg += `\n\n📊 Seulement ${result.available} épisode(s) disponible(s)`;
        }
        await sock.sendMessage(senderJid, { text: errorMsg });
        return;
      }

      // Send to DM
      const dmJid = isGroup ? userJid : senderJid;
      let dm_text = `🎌 *${result.anime}*\n`;
      dm_text += `📺 *Épisode ${result.episode}*\n\n`;
      dm_text += `${result.title}\n\n`;
      dm_text += `🔗 Lien: ${result.link}\n\n`;
      dm_text += `📖 Ouvrez ce lien pour regarder l'épisode\n\n`;
      dm_text += `_${result.total_episodes} épisodes disponibles_`;

      await new Promise(r => setTimeout(r, 300));
      await sock.sendMessage(dmJid, { text: dm_text });

      if (isGroup) {
        await sock.sendMessage(senderJid, {
          text: `✅ Le lien de "${result.anime}" épisode ${result.episode} a été envoyé en DM`
        });
      } else {
        await sock.sendMessage(senderJid, {
          text: `✅ Lien trouvé et envoyé!`
        });
      }

    } catch (error) {
      console.error('Error in voiranime command:', error.message);
      
      let errorMsg = '❌ Erreur lors de la recherche.\n\n';
      
      if (error.message.includes('ENOENT') || error.message.includes('python')) {
        errorMsg += '⚠️ Python n\'est pas installé ou pas trouvé\n\n';
        errorMsg += 'Installation:\n';
        errorMsg += '`pip install requests beautifulsoup4`';
      } else if (error.message.includes('timeout')) {
        errorMsg += '⏱️ Timeout - VoirAnime met trop de temps à répondre\n';
        errorMsg += 'Réessayez dans quelques secondes';
      } else {
        errorMsg += 'Causes possibles:\n';
        errorMsg += '• VoirAnime indisponible\n';
        errorMsg += '• Anime inexistant\n';
        errorMsg += '• Problème de connexion\n\n';
        errorMsg += 'Réessayez dans quelques minutes!';
      }
      
      await sock.sendMessage(senderJid, { text: errorMsg });
    }
  },

  callPythonScraper(animeName, episodeNum) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, '../..', 'scripts', 'voiranime_scraper.py');
      const fs = require('fs');
      
      // Determine Python command
      let pythonCmd = 'python3'; // Default for Linux/Railway
      
      if (os.platform() === 'win32') {
        // Windows: try venv first, then system python
        const venvPython = path.join(__dirname, '../..', '.venv', 'Scripts', 'python.exe');
        pythonCmd = fs.existsSync(venvPython) ? venvPython : 'python';
      } else {
        // Unix/Linux/Mac/Railway: use system python3
        pythonCmd = 'python3';
      }

      console.log(`[VOIRANIME] Platform: ${os.platform()}`);
      console.log(`[VOIRANIME] Using python: ${pythonCmd}`);
      console.log(`[VOIRANIME] Anime: ${animeName}, Episode: ${episodeNum}`);

      const pythonProcess = spawn(pythonCmd, [scriptPath, animeName, episodeNum.toString()], {
        timeout: 30000,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(`[VOIRANIME] Python stderr: ${data.toString()}`);
      });

      pythonProcess.on('close', (code) => {
        console.log(`[VOIRANIME] Python process exited with code: ${code}`);
        
        if (code !== 0) {
          reject(new Error(`Python script failed (code ${code}): ${errorOutput || 'Unknown error'}`));
          return;
        }

        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch (e) {
          console.error(`[VOIRANIME] Failed to parse JSON: ${output}`);
          reject(new Error(`Failed to parse Python output: ${output}`));
        }
      });

      pythonProcess.on('error', (err) => {
        console.error(`[VOIRANIME] Failed to spawn Python: ${err.message}`);
        reject(new Error(`Failed to spawn Python process: ${err.message}\n\nMake sure Python is installed and in your PATH.\nInstall with: pip install requests beautifulsoup4`));
      });
    });
  }
};
