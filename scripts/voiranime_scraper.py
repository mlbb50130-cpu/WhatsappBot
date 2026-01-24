#!/usr/bin/env python3
"""
VoirAnime Scraper - Python script to fetch anime episodes
Handles CloudFlare protection better than Node.js
"""

import sys
import json
import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote

# Session persistante pour CloudFlare
session = requests.Session()

# Meilleurs headers pour CloudFlare
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Sec-Ch-Ua': '"Not A(Brand";v="99", "Microsoft Edge";v="121", "Chromium";v="121"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Cache-Control': 'max-age=0',
    'Pragma': 'no-cache'
})

def search_anime(anime_name):
    """Search for anime on VoirAnime with retries"""
    max_retries = 3
    for attempt in range(max_retries):
        try:
            url = f'https://www.voiranime.com/search?q={quote(anime_name)}'
            print(f"[Attempt {attempt + 1}] Searching: {url}", file=sys.stderr)
            
            response = session.get(url, timeout=20, allow_redirects=True)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find first anime result
            anime_link = soup.find('a', class_='film-poster')
            if not anime_link:
                return None
            
            link = anime_link.get('href', '')
            if not link.startswith('http'):
                link = f'https://www.voiranime.com{link}'
            
            title = anime_link.find('span', class_='film-name')
            title_text = title.text.strip() if title else 'Anime'
            
            return {
                'title': title_text,
                'link': link
            }
        
        except requests.exceptions.HTTPError as e:
            if '523' in str(e):
                print(f"[Attempt {attempt + 1}] CloudFlare 523 - Waiting...", file=sys.stderr)
                time.sleep(2 + attempt * 2)  # Progressive delay
                continue
            raise
        except requests.exceptions.Timeout:
            print(f"[Attempt {attempt + 1}] Timeout", file=sys.stderr)
            time.sleep(2)
            continue
        except Exception as e:
            print(f"Error searching anime: {str(e)}", file=sys.stderr)
            return None
    
    return None

def get_episodes(anime_url):
    """Fetch episodes from anime page"""
    try:
        print(f"Fetching episodes from: {anime_url}", file=sys.stderr)
        response = session.get(anime_url, timeout=20)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        episodes = []
        
        # Try multiple selectors for episodes
        selectors = [
            'a.ep-item',
            'a.episode-link',
            'div.episode a',
            'a[class*="episode"]',
            'li a[href*="episode"]'
        ]
        
        for selector in selectors:
            episode_links = soup.select(selector)
            if episode_links:
                for ep_link in episode_links:
                    ep_text = ep_link.text.strip()
                    ep_url = ep_link.get('href', '')
                    
                    if ep_text and ep_url:
                        if not ep_url.startswith('http'):
                            ep_url = f'https://www.voiranime.com{ep_url}'
                        
                        episodes.append({
                            'num': len(episodes) + 1,
                            'title': ep_text[:100],
                            'link': ep_url
                        })
                
                if episodes:
                    break
        
        return episodes
    
    except requests.exceptions.Timeout:
        return []
    except Exception as e:
        print(f"Error fetching episodes: {str(e)}", file=sys.stderr)
        return []

def main():
    """Main function"""
    if len(sys.argv) < 3:
        result = {
            'success': False,
            'error': 'Usage: python voiranime_scraper.py <anime_name> <episode_number>'
        }
        print(json.dumps(result, ensure_ascii=False))
        return
    
    anime_name = ' '.join(sys.argv[1:-1])
    try:
        episode_num = int(sys.argv[-1])
    except ValueError:
        result = {
            'success': False,
            'error': 'Invalid episode number'
        }
        print(json.dumps(result, ensure_ascii=False))
        return
    
    if episode_num <= 0:
        result = {
            'success': False,
            'error': 'Episode number must be positive'
        }
        print(json.dumps(result, ensure_ascii=False))
        return
    
    # Search anime
    anime = search_anime(anime_name)
    if not anime:
        result = {
            'success': False,
            'error': f'Anime "{anime_name}" not found on VoirAnime'
        }
        print(json.dumps(result, ensure_ascii=False))
        return
    
    # Small delay to avoid rate limiting
    time.sleep(1)
    
    # Get episodes
    episodes = get_episodes(anime['link'])
    if not episodes:
        result = {
            'success': False,
            'error': f'No episodes found for "{anime["title"]}"'
        }
        print(json.dumps(result, ensure_ascii=False))
        return
    
    # Check if episode exists
    if episode_num > len(episodes):
        result = {
            'success': False,
            'error': f'Episode {episode_num} not found. Only {len(episodes)} episode(s) available.',
            'available': len(episodes)
        }
        print(json.dumps(result, ensure_ascii=False))
        return
    
    # Get target episode
    target_episode = episodes[episode_num - 1]
    
    result = {
        'success': True,
        'anime': anime['title'],
        'episode': episode_num,
        'title': target_episode['title'],
        'link': target_episode['link'],
        'total_episodes': len(episodes)
    }
    
    print(json.dumps(result, ensure_ascii=False, indent=2))

def main():
    """Main function"""
    if len(sys.argv) < 3:
        result = {
            'success': False,
            'error': 'Usage: python voiranime_scraper.py <anime_name> <episode_number>'
        }
        print(json.dumps(result, ensure_ascii=False))
        return
    
    anime_name = ' '.join(sys.argv[1:-1])
    try:
        episode_num = int(sys.argv[-1])
    except ValueError:
        result = {
            'success': False,
            'error': 'Invalid episode number'
        }
        print(json.dumps(result, ensure_ascii=False))
        return
    
    if episode_num <= 0:
        result = {
            'success': False,
            'error': 'Episode number must be positive'
        }
        print(json.dumps(result, ensure_ascii=False))
        return
    
    # Search anime
    anime = search_anime(anime_name)
    if not anime:
        result = {
            'success': False,
            'error': f'Anime "{anime_name}" not found on VoirAnime'
        }
        print(json.dumps(result, ensure_ascii=False))
        return
    
    # Small delay to avoid rate limiting
    time.sleep(0.5)
    
    # Get episodes
    episodes = get_episodes(anime['link'])
    if not episodes:
        result = {
            'success': False,
            'error': f'No episodes found for "{anime["title"]}"'
        }
        print(json.dumps(result, ensure_ascii=False))
        return
    
    # Check if episode exists
    if episode_num > len(episodes):
        result = {
            'success': False,
            'error': f'Episode {episode_num} not found. Only {len(episodes)} episode(s) available.',
            'available': len(episodes)
        }
        print(json.dumps(result, ensure_ascii=False))
        return
    
    # Get target episode
    target_episode = episodes[episode_num - 1]
    
    result = {
        'success': True,
        'anime': anime['title'],
        'episode': episode_num,
        'title': target_episode['title'],
        'link': target_episode['link'],
        'total_episodes': len(episodes)
    }
    
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
