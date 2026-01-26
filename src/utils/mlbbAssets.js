const fs = require('fs');
const path = require('path');

const ASSETS_PATH = path.join(__dirname, '../commands/mlbb/assets');

class MLBBAssets {
  // Obtenir une image aléatoire pour un héros
  static getRandomHeroImage(heroName) {
    try {
      // Normaliser le nom du héros (minuscules)
      const normalizedName = heroName.toLowerCase().trim();
      const heroPath = path.join(ASSETS_PATH, normalizedName);

      // Vérifier que le dossier existe
      if (!fs.existsSync(heroPath)) {
        return null;
      }

      // Lister tous les fichiers image
      const files = fs.readdirSync(heroPath).filter(file => {
        return /\.(jpg|jpeg|png|gif)$/i.test(file);
      });

      // Si aucune image trouvée
      if (files.length === 0) {
        return null;
      }

      // Sélectionner une image aléatoire
      const randomImage = files[Math.floor(Math.random() * files.length)];
      return path.join(heroPath, randomImage);
    } catch (error) {
      console.error(`Erreur lors de la récupération d'image pour ${heroName}:`, error);
      return null;
    }
  }

  // Vérifier si un héros a des images disponibles
  static hasHeroImages(heroName) {
    try {
      const normalizedName = heroName.toLowerCase().trim();
      const heroPath = path.join(ASSETS_PATH, normalizedName);

      if (!fs.existsSync(heroPath)) {
        return false;
      }

      const files = fs.readdirSync(heroPath).filter(file => {
        return /\.(jpg|jpeg|png|gif)$/i.test(file);
      });

      return files.length > 0;
    } catch (error) {
      return false;
    }
  }

  // Obtenir tous les héros disponibles avec images
  static getAvailableHeroes() {
    try {
      const heroes = fs.readdirSync(ASSETS_PATH, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .filter(name => this.hasHeroImages(name))
        .sort();

      return heroes;
    } catch (error) {
      console.error('Erreur lors de la récupération des héros disponibles:', error);
      return [];
    }
  }

  // Obtenir le nombre d'images pour un héros
  static getHeroImageCount(heroName) {
    try {
      const normalizedName = heroName.toLowerCase().trim();
      const heroPath = path.join(ASSETS_PATH, normalizedName);

      if (!fs.existsSync(heroPath)) {
        return 0;
      }

      const files = fs.readdirSync(heroPath).filter(file => {
        return /\.(jpg|jpeg|png|gif)$/i.test(file);
      });

      return files.length;
    } catch (error) {
      return 0;
    }
  }
}

module.exports = MLBBAssets;
