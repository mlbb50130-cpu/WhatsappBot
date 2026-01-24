# Anime Backend API

API FastAPI pour le scraping d'anime avec cache et gestion d'erreurs robuste.

## Installation

```bash
pip install -r requirements.txt
```

## Lancement

```bash
python main.py
```

L'API sera accessible sur `http://localhost:8000`

## Utilisation

### Endpoint: GET /anime

**Paramètres:**
- `name` (string, obligatoire): Nom de l'anime
- `episode` (integer, obligatoire): Numéro d'épisode
- `lang` (string, optionnel): Langue - 'vf' ou 'vostfr' (par défaut: vostfr)

**Exemple:**
```
GET /anime?name=solo leveling&episode=1&lang=vostfr
```

**Réponse (200 OK):**
```json
{
  "title": "Solo Leveling",
  "synopsis": "Un chasseur ordinaire...",
  "image": "https://...",
  "language": "VOSTFR",
  "episode": 1,
  "episodes_list": [1, 2, 3, 4, 5],
  "stream_link": "https://..."
}
```

**Erreurs:**
- 400: Paramètres invalides
- 404: Anime ou épisode non trouvé
- 503: Lien de streaming indisponible ou site inaccessible

## Fonctionnalités

✅ Scraping avec requests + BeautifulSoup  
✅ Cache JSON persistant (TTL configurable)  
✅ Gestion complète des erreurs  
✅ Support VF/VOSTFR  
✅ User-Agent pour accès site  
✅ Validation des entrées  
✅ Logs détaillés  

## Fichiers

- `main.py`: API FastAPI
- `scraper.py`: Logique de scraping
- `cache.py`: Gestion du cache
- `utils.py`: Fonctions utilitaires
