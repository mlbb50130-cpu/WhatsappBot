class ImageRotationSystem {
  // Check if daily image tracking needs reset (24h)
  static needsDailyReset(object) {
    if (!object.dailyImages || !object.dailyImages.lastReset) return true;
    const now = Date.now();
    const lastReset = new Date(object.dailyImages.lastReset).getTime();
    return (now - lastReset) >= (24 * 60 * 60 * 1000);
  }

  // Reset daily images
  static resetDailyImages(object) {
    object.dailyImages = {
      lastReset: new Date(),
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
        boahancook: []
      }
    };
  }

  // Get next available image for a command (supports user or group)
  static getNextImage(object, commandName, availableFiles) {
    if (!object.dailyImages) {
      this.resetDailyImages(object);
    }

    if (this.needsDailyReset(object)) {
      this.resetDailyImages(object);
    }

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
}

module.exports = ImageRotationSystem;
