from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import logging

from scraper import VoiAnimeScraper
from cache import CacheManager
from utils import normalize_anime_name, validate_episode_number, validate_language, normalize_language


# Setup
app = FastAPI(title="Anime Backend API", version="1.0.0")
scraper = VoiAnimeScraper()
cache = CacheManager(ttl_hours=12)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Response model
class AnimeResponse(BaseModel):
    title: str
    synopsis: str
    image: str
    language: str
    episode: int
    episodes_list: List[int]
    stream_link: str


class ErrorResponse(BaseModel):
    error: str
    details: Optional[str] = None


@app.get("/anime", response_model=AnimeResponse, responses={
    400: {"model": ErrorResponse},
    404: {"model": ErrorResponse},
    503: {"model": ErrorResponse}
})
async def get_anime(
    name: str = Query(..., min_length=1, description="Anime name"),
    episode: int = Query(..., gt=0, description="Episode number"),
    lang: Optional[str] = Query(None, description="Language: vf or vostfr")
):
    """
    Get anime information with streaming link
    
    Query Parameters:
    - name: Anime name (required)
    - episode: Episode number (required, must be > 0)
    - lang: Language - 'vf' or 'vostfr' (optional, defaults to vostfr)
    
    Returns: Anime data with streaming link
    """
    
    try:
        # Input validation
        if not name or not name.strip():
            raise HTTPException(
                status_code=400,
                detail="Anime name cannot be empty"
            )
        
        if not validate_episode_number(episode):
            raise HTTPException(
                status_code=400,
                detail="Episode must be a positive integer"
            )
        
        # Language handling
        language = normalize_language(lang) if lang else "VOSTFR"
        language_lower = language.lower()
        
        if not validate_language(language):
            raise HTTPException(
                status_code=400,
                detail="Language must be 'vf' or 'vostfr'"
            )
        
        # Normalize anime name for caching
        normalized_name = normalize_anime_name(name)
        
        # Check cache first
        cache_key = f"{normalized_name}_{language_lower}"
        cached_data = cache.get(normalized_name, language_lower)
        
        if cached_data:
            logger.info(f"Cache hit for {normalized_name} ({language_lower})")
            return AnimeResponse(**cached_data)
        
        # Scrape if not in cache
        logger.info(f"Scraping {normalized_name} episode {episode} ({language_lower})")
        anime_data = scraper.get_anime_data(normalized_name, episode, language_lower)
        
        if not anime_data:
            raise HTTPException(
                status_code=404,
                detail=f"Anime '{name}' episode {episode} not found or stream unavailable"
            )
        
        # Validate required fields
        if not anime_data.get('stream_link'):
            raise HTTPException(
                status_code=503,
                detail="Streaming link unavailable for this episode"
            )
        
        # Cache the result
        cache.set(normalized_name, language_lower, anime_data)
        
        return AnimeResponse(**anime_data)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail="Service temporarily unavailable"
        )


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=503,
        content={"error": "Internal server error", "details": None}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
