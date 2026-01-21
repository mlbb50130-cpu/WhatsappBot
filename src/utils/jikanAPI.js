// 🔧 Utilitaire Jikan API - Intégration Anime Data
const axios = require('axios');

const JIKAN_API = process.env.JIKAN_API || 'https://api.jikan.moe/v4';
const JIKAN_TIMEOUT = parseInt(process.env.JIKAN_TIMEOUT) || 10000;

class JikanAPI {
  /**
   * Recherche un anime par nom
   * @param {string} animeName - Nom de l'anime
   * @returns {Promise<Object>} Données anime
   */
  static async searchAnime(animeName) {
    try {
      const response = await axios.get(
        `${JIKAN_API}/anime`,
        {
          params: {
            query: animeName,
            limit: 1,
            status: 'complete'
          },
          timeout: JIKAN_TIMEOUT
        }
      );

      if (!response.data.data || response.data.data.length === 0) {
        return null;
      }

      const anime = response.data.data[0];
      return this._formatAnimeData(anime);
    } catch (error) {
      console.error(`[Jikan] Anime search error: ${error.message}`);
      return null;
    }
  }

  /**
   * Recherche un manga par nom
   * @param {string} mangaName - Nom du manga
   * @returns {Promise<Object>} Données manga
   */
  static async searchManga(mangaName) {
    try {
      const response = await axios.get(
        `${JIKAN_API}/manga`,
        {
          params: {
            query: mangaName,
            limit: 1
          },
          timeout: JIKAN_TIMEOUT
        }
      );

      if (!response.data.data || response.data.data.length === 0) {
        return null;
      }

      const manga = response.data.data[0];
      return this._formatMangaData(manga);
    } catch (error) {
      console.error(`[Jikan] Manga search error: ${error.message}`);
      return null;
    }
  }

  /**
   * Recherche un personnage par nom
   * @param {string} characterName - Nom du personnage
   * @returns {Promise<Object>} Données personnage
   */
  static async searchCharacter(characterName) {
    try {
      const response = await axios.get(
        `${JIKAN_API}/characters`,
        {
          params: {
            query: characterName,
            limit: 1
          },
          timeout: JIKAN_TIMEOUT
        }
      );

      if (!response.data.data || response.data.data.length === 0) {
        return null;
      }

      const character = response.data.data[0];
      return this._formatCharacterData(character);
    } catch (error) {
      console.error(`[Jikan] Character search error: ${error.message}`);
      return null;
    }
  }

  /**
   * Obtient les top animes
   * @param {string} type - 'airing', 'upcoming', 'bypopularity'
   * @returns {Promise<Array>} Liste des top animes
   */
  static async getTopAnime(type = 'airing', limit = 10) {
    try {
      const response = await axios.get(
        `${JIKAN_API}/top/anime`,
        {
          params: {
            filter: type,
            limit: limit
          },
          timeout: JIKAN_TIMEOUT
        }
      );

      return response.data.data.map(anime => this._formatAnimeData(anime));
    } catch (error) {
      console.error(`[Jikan] Top anime error: ${error.message}`);
      return [];
    }
  }

  /**
   * Obtient les top mangas
   * @param {string} type - 'manga', 'manhua', 'manhwa', 'light_novel'
   * @returns {Promise<Array>} Liste des top mangas
   */
  static async getTopManga(type = 'manga', limit = 10) {
    try {
      const response = await axios.get(
        `${JIKAN_API}/top/manga`,
        {
          params: {
            filter: type,
            limit: limit
          },
          timeout: JIKAN_TIMEOUT
        }
      );

      return response.data.data.map(manga => this._formatMangaData(manga));
    } catch (error) {
      console.error(`[Jikan] Top manga error: ${error.message}`);
      return [];
    }
  }

  /**
   * Recherche par genre
   * @param {string} genre - 'action', 'adventure', 'comedy', etc.
   * @returns {Promise<Array>} Animes du genre
   */
  static async searchByGenre(genre, limit = 10) {
    try {
      const response = await axios.get(
        `${JIKAN_API}/anime`,
        {
          params: {
            genres: genre,
            limit: limit,
            min_score: 6
          },
          timeout: JIKAN_TIMEOUT
        }
      );

      return response.data.data.map(anime => this._formatAnimeData(anime));
    } catch (error) {
      console.error(`[Jikan] Genre search error: ${error.message}`);
      return [];
    }
  }

  /**
   * Formatte les données anime
   * @private
   */
  static _formatAnimeData(anime) {
    return {
      id: anime.mal_id,
      title: anime.title,
      titleEnglish: anime.title_english || 'N/A',
      titleJapanese: anime.title_japanese || 'N/A',
      synopsis: (anime.synopsis || 'N/A').substring(0, 200) + '...',
      episodes: anime.episodes || '?',
      status: anime.status,
      aired: anime.aired?.string || 'N/A',
      studios: anime.studios?.map(s => s.name).join(', ') || 'N/A',
      genres: anime.genres?.map(g => g.name).join(', ') || 'N/A',
      score: anime.score || 'N/A',
      rating: anime.rating || 'N/A',
      type: anime.type,
      source: anime.source || 'N/A',
      image: anime.images?.jpg?.large_image_url,
      url: anime.url,
      season: anime.season || 'N/A',
      year: anime.year || 'N/A',
    };
  }

  /**
   * Formatte les données manga
   * @private
   */
  static _formatMangaData(manga) {
    return {
      id: manga.mal_id,
      title: manga.title,
      titleEnglish: manga.title_english || 'N/A',
      titleJapanese: manga.title_japanese || 'N/A',
      synopsis: (manga.synopsis || 'N/A').substring(0, 200) + '...',
      chapters: manga.chapters || '?',
      volumes: manga.volumes || '?',
      status: manga.status,
      published: manga.published?.string || 'N/A',
      authors: manga.authors?.map(a => a.name).join(', ') || 'N/A',
      genres: manga.genres?.map(g => g.name).join(', ') || 'N/A',
      score: manga.score || 'N/A',
      type: manga.type,
      image: manga.images?.jpg?.large_image_url,
      url: manga.url,
    };
  }

  /**
   * Formatte les données personnage
   * @private
   */
  static _formatCharacterData(character) {
    return {
      id: character.mal_id,
      name: character.name,
      nameKanji: character.name_kanji || 'N/A',
      about: (character.about || 'N/A').substring(0, 200) + '...',
      image: character.images?.jpg?.image_url,
      url: character.url,
      voiceActors: character.voice_actors?.length || 0,
      favorites: character.favorites || 0,
    };
  }
}

module.exports = JikanAPI;
