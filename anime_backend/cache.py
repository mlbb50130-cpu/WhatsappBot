import json
import os
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, Any


class CacheManager:
    def __init__(self, cache_dir: str = "cache", ttl_hours: int = 12):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        self.ttl_seconds = ttl_hours * 3600
        self.metadata_file = self.cache_dir / "metadata.json"
        self.load_metadata()

    def load_metadata(self):
        """Load cache metadata from file"""
        if self.metadata_file.exists():
            try:
                with open(self.metadata_file, 'r', encoding='utf-8') as f:
                    self.metadata = json.load(f)
            except Exception:
                self.metadata = {}
        else:
            self.metadata = {}

    def save_metadata(self):
        """Save cache metadata to file"""
        try:
            with open(self.metadata_file, 'w', encoding='utf-8') as f:
                json.dump(self.metadata, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Error saving metadata: {e}")

    def get_cache_key(self, anime_name: str, language: str) -> str:
        """Generate cache key from anime name and language"""
        return f"{anime_name}_{language}".replace(" ", "_").lower()

    def get(self, anime_name: str, language: str) -> Optional[Any]:
        """Retrieve cached data if valid"""
        cache_key = self.get_cache_key(anime_name, language)
        
        if cache_key not in self.metadata:
            return None
        
        meta = self.metadata[cache_key]
        timestamp = meta.get("timestamp", 0)
        
        # Check if cache expired
        if time.time() - timestamp > self.ttl_seconds:
            self.delete(cache_key)
            return None
        
        cache_file = self.cache_dir / f"{cache_key}.json"
        if not cache_file.exists():
            return None
        
        try:
            with open(cache_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return None

    def set(self, anime_name: str, language: str, data: Any):
        """Store data in cache"""
        cache_key = self.get_cache_key(anime_name, language)
        cache_file = self.cache_dir / f"{cache_key}.json"
        
        try:
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            self.metadata[cache_key] = {
                "timestamp": time.time(),
                "anime_name": anime_name,
                "language": language
            }
            self.save_metadata()
        except Exception as e:
            print(f"Error caching data: {e}")

    def delete(self, cache_key: str):
        """Delete cache entry"""
        cache_file = self.cache_dir / f"{cache_key}.json"
        try:
            if cache_file.exists():
                cache_file.unlink()
            if cache_key in self.metadata:
                del self.metadata[cache_key]
                self.save_metadata()
        except Exception as e:
            print(f"Error deleting cache: {e}")

    def clear_expired(self):
        """Clear all expired cache entries"""
        current_time = time.time()
        expired_keys = [
            key for key, meta in self.metadata.items()
            if current_time - meta.get("timestamp", 0) > self.ttl_seconds
        ]
        for key in expired_keys:
            self.delete(key)
