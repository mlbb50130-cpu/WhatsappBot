class ImageRotationSystem {
  // Check if daily image tracking needs reset (24h)
  static needsDailyReset(user) {
    if (!user.dailyImages || !user.dailyImages.lastReset) return true;
    const now = Date.now();
    const lastReset = new Date(user.dailyImages.lastReset).getTime();
    return (now - lastReset) >= (24 * 60 * 60 * 1000);
  }

  // Reset daily images
  static resetDailyImages(user) {
    user.dailyImages = {
      lastReset: new Date(),
      used: {
        naruto: [],
        madara: [],
        miku: [],
        nino: [],
        yoruichi: [],
        bleach: []
      }
    };
  }

  // Get next available image for a command
  static getNextImage(user, commandName, availableFiles) {
    if (!user.dailyImages) {
      this.resetDailyImages(user);
    }

    if (this.needsDailyReset(user)) {
      this.resetDailyImages(user);
    }

    // Initialize command if not exists
    if (!user.dailyImages.used[commandName]) {
      user.dailyImages.used[commandName] = [];
    }

    const usedImages = user.dailyImages.used[commandName] || [];
    
    // Si toutes les images ont été utilisées, réinitialiser la liste
    if (usedImages.length >= availableFiles.length) {
      user.dailyImages.used[commandName] = [];
    }

    // Trouver une image non utilisée
    let availableImage = availableFiles.find(file => !usedImages.includes(file));
    
    // Si aucune image disponible (ne devrait pas arriver ici), en prendre une au hasard
    if (!availableImage) {
      availableImage = availableFiles[Math.floor(Math.random() * availableFiles.length)];
      user.dailyImages.used[commandName] = [];
    }

    // Ajouter l'image à la liste des utilisées
    user.dailyImages.used[commandName].push(availableImage);

    return availableImage;
  }
}

module.exports = ImageRotationSystem;
