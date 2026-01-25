class ImageRotationSystem {
  // Check if 24 hours have passed since last reset
  static needsDailyReset(lastReset) {
    if (!lastReset) return true;
    const now = Date.now();
    const lastResetTime = new Date(lastReset).getTime();
    return (now - lastResetTime) >= (24 * 60 * 60 * 1000);
  }

  // Initialize image tracking system
  static initializeDailyImages(object) {
    if (!object.dailyImages) {
      object.dailyImages = {
        used: {
          naruto: [],
          madara: [],
          miku: [],
          nino: [],
          yoruichi: [],
          bleach: [],
          zerotwo: [],
          yami: [],
          tsunade: [],
          tengen: [],
          sukuna: [],
          rengokudemon: [],
          makima: [],
          mikunakano: [],
          livai: [],
          nsfw: [],
          jinwoo: [],
          husbando: [],
          gokuui: [],
          gojo: [],
          deku: [],
          boahancook: [],
          waifu: [],
          hentai: [],
          hentaivd: [],
          vegito: []
        },
        dailyLimits: {
          hentai: { usedToday: 0, lastReset: new Date() },
          hentaivd: { usedToday: 0, lastReset: new Date() }
        }
      };
    } else {
      // Ensure dailyLimits exists for existing objects
      if (!object.dailyImages.dailyLimits) {
        object.dailyImages.dailyLimits = {
          hentai: { usedToday: 0, lastReset: new Date() },
          hentaivd: { usedToday: 0, lastReset: new Date() }
        };
      }
    }
  }

  // Get next available image for a command (permanent tracking - never repeat)
  static getNextImage(object, commandName, availableFiles) {
    this.initializeDailyImages(object);

    // Initialize command if not exists
    if (!object.dailyImages.used[commandName]) {
      object.dailyImages.used[commandName] = [];
    }

    const usedImages = object.dailyImages.used[commandName] || [];
    
    // Si toutes les images ont été utilisées, réinitialiser la liste
    if (usedImages.length >= availableFiles.length) {
      object.dailyImages.used[commandName] = [];
    }

    // Trouver une image non utilisée
    let availableImage = availableFiles.find(file => !usedImages.includes(file));
    
    // Si aucune image disponible (ne devrait pas arriver ici), en prendre une au hasard
    if (!availableImage) {
      availableImage = availableFiles[Math.floor(Math.random() * availableFiles.length)];
      object.dailyImages.used[commandName] = [];
    }

    // Ajouter l'image à la liste des utilisées
    object.dailyImages.used[commandName].push(availableImage);

    return availableImage;
  }

  // Get image with daily limit (2 times per day for hentai commands)
  static getImageWithDailyLimit(object, commandName, availableFiles, maxUsesPerDay = 2) {
    this.initializeDailyImages(object);

    // Initialize command if not exists
    if (!object.dailyImages.used[commandName]) {
      object.dailyImages.used[commandName] = [];
    }

    // Initialize daily limit tracking
    if (!object.dailyImages.dailyLimits[commandName]) {
      object.dailyImages.dailyLimits[commandName] = {
        usedToday: 0,
        lastReset: new Date()
      };
    }

    const dailyLimit = object.dailyImages.dailyLimits[commandName];

    // Reset counter if 24 hours have passed
    if (this.needsDailyReset(dailyLimit.lastReset)) {
      dailyLimit.usedToday = 0;
      dailyLimit.lastReset = new Date();
    }

    // Check if limit reached for today
    if (dailyLimit.usedToday >= maxUsesPerDay) {
      return null; // Limit reached
    }

    const usedImages = object.dailyImages.used[commandName] || [];
    
    // Si toutes les images ont été utilisées, réinitialiser la liste
    if (usedImages.length >= availableFiles.length) {
      object.dailyImages.used[commandName] = [];
    }

    // Trouver une image non utilisée
    let availableImage = availableFiles.find(file => !usedImages.includes(file));
    
    // Si aucune image disponible, en prendre une au hasard
    if (!availableImage) {
      availableImage = availableFiles[Math.floor(Math.random() * availableFiles.length)];
      object.dailyImages.used[commandName] = [];
    }

    // Ajouter l'image à la liste des utilisées
    object.dailyImages.used[commandName].push(availableImage);

    // Increment daily counter
    dailyLimit.usedToday++;

    return availableImage;
  }
}

module.exports = ImageRotationSystem;
