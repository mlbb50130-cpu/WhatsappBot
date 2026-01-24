import requests
from bs4 import BeautifulSoup
from typing import Dict, List, Optional, Tuple
from utils import normalize_anime_name, sanitize_synopsis, extract_episode_numbers


class VoiAnimeScraper:
    BASE_URL = "https://voiranime.com"
    
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        self.timeout = 10

    def search_anime(self, anime_name: str) -> Optional[str]:
        """
        Search for anime on voiranime.com and return the anime page URL
        Returns None if not found
        """
        normalized_name = normalize_anime_name(anime_name)
        
        try:
            # Try direct URL construction first (most common pattern)
            potential_url = f"{self.BASE_URL}/anime/{normalized_name}"
            response = requests.head(potential_url, headers=self.headers, timeout=self.timeout, allow_redirects=True)
            
            if response.status_code == 200:
                return response.url
            
            # Fallback: search via search endpoint
            search_url = f"{self.BASE_URL}/search?q={anime_name}"
            response = requests.get(search_url, headers=self.headers, timeout=self.timeout)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            anime_link = soup.find('a', {'href': lambda x: x and normalized_name in x.lower()})
            
            if anime_link and anime_link.get('href'):
                href = anime_link['href']
                if not href.startswith('http'):
                    href = self.BASE_URL + href
                return href
            
            return None
            
        except Exception as e:
            print(f"Search error for {anime_name}: {e}")
            return None

    def scrape_anime_page(self, anime_url: str) -> Optional[Dict]:
        """
        Scrape anime details from the anime page
        Returns dict with title, synopsis, image, episodes, languages
        """
        try:
            response = requests.get(anime_url, headers=self.headers, timeout=self.timeout)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract title
            title_elem = soup.find('h1', class_=['anime-title', 'entry-title'])
            if not title_elem:
                title_elem = soup.find('h1')
            title = title_elem.get_text(strip=True) if title_elem else None
            
            if not title:
                return None
            
            # Extract synopsis
            synopsis_elem = soup.find('div', class_=['synopsis', 'description', 'entry-content'])
            synopsis = sanitize_synopsis(synopsis_elem.get_text()) if synopsis_elem else ""
            
            # Extract poster image
            image_elem = soup.find('img', class_=['poster', 'entry-image'])
            if not image_elem:
                image_elem = soup.find('img', {'alt': title})
            image_url = image_elem.get('src', '') if image_elem else ""
            if image_url and not image_url.startswith('http'):
                image_url = self.BASE_URL + image_url
            
            # Extract episodes
            episodes_data = self._extract_episodes(soup)
            
            return {
                'title': title,
                'synopsis': synopsis,
                'image': image_url,
                'episodes': episodes_data,
                'url': anime_url
            }
            
        except Exception as e:
            print(f"Scrape error for {anime_url}: {e}")
            return None

    def _extract_episodes(self, soup: BeautifulSoup) -> Dict[str, List]:
        """
        Extract episodes with VF and VOSTFR versions
        Returns dict: {'vf': [ep_nums], 'vostfr': [ep_nums], 'all': [ep_nums]}
        """
        episodes = {'vf': [], 'vostfr': [], 'all': []}
        
        try:
            # Find episode links
            episode_links = soup.find_all('a', class_=lambda x: x and 'episode' in x.lower())
            if not episode_links:
                episode_links = soup.find_all('a', {'href': lambda x: x and 'episode' in x.lower()})
            
            for link in episode_links:
                text = link.get_text(strip=True).lower()
                
                # Try to extract episode number
                import re
                match = re.search(r'ep(?:isode)?\s*(\d+)', text)
                if match:
                    ep_num = int(match.group(1))
                    
                    # Determine language
                    if 'vf' in text:
                        if ep_num not in episodes['vf']:
                            episodes['vf'].append(ep_num)
                    elif 'vostfr' in text:
                        if ep_num not in episodes['vostfr']:
                            episodes['vostfr'].append(ep_num)
                    
                    if ep_num not in episodes['all']:
                        episodes['all'].append(ep_num)
            
            # Sort lists
            for key in episodes:
                episodes[key] = sorted(episodes[key])
            
            # If no language tags found, assume all are available in both
            if not episodes['vf'] and not episodes['vostfr'] and episodes['all']:
                episodes['vf'] = episodes['all'][:]
                episodes['vostfr'] = episodes['all'][:]
            
            return episodes
            
        except Exception as e:
            print(f"Episode extraction error: {e}")
            return episodes

    def get_episode_stream_link(self, anime_url: str, episode: int, language: str) -> Optional[str]:
        """
        Get streaming link for specific episode and language
        Language: 'vf' or 'vostfr'
        """
        try:
            response = requests.get(anime_url, headers=self.headers, timeout=self.timeout)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Search for episode player/iframe
            episode_pattern = f"ep(?:isode)?\\s*{episode}".lower()
            import re
            
            # Look for episode container
            episode_section = None
            for div in soup.find_all('div', class_=lambda x: x and 'episode' in x.lower()):
                if re.search(episode_pattern, div.get_text().lower()):
                    episode_section = div
                    break
            
            if not episode_section:
                return None
            
            # Find iframe or stream link within episode section
            iframe = episode_section.find('iframe')
            if iframe and iframe.get('src'):
                return iframe['src']
            
            # Look for video player container
            player = episode_section.find(['div', 'section'], class_=lambda x: x and 'player' in x.lower())
            if player:
                iframe = player.find('iframe')
                if iframe and iframe.get('src'):
                    return iframe['src']
            
            # Fallback: look for any iframe in episode section
            iframes = episode_section.find_all('iframe')
            if iframes:
                for iframe in iframes:
                    src = iframe.get('src', '')
                    if src and ('dailymotion' in src or 'youtube' in src or 'gogocdn' in src or 'vidcdn' in src):
                        return src
            
            return None
            
        except Exception as e:
            print(f"Stream link extraction error: {e}")
            return None

    def get_anime_data(self, anime_name: str, episode: int, language: str = 'vostfr') -> Optional[Dict]:
        """
        Complete workflow: search, scrape, and get stream link
        """
        anime_url = self.search_anime(anime_name)
        if not anime_url:
            return None
        
        anime_data = self.scrape_anime_page(anime_url)
        if not anime_data:
            return None
        
        # Check if episode exists and language is available
        episodes = anime_data['episodes']
        lang_lower = language.lower()
        
        available_episodes = episodes.get(lang_lower, [])
        if not available_episodes and episodes.get('all'):
            available_episodes = episodes['all']
            if lang_lower not in episodes:
                lang_lower = 'vostfr' if 'vostfr' in episodes else 'vf'
        
        if episode not in available_episodes and episodes.get('all'):
            return None
        
        stream_link = self.get_episode_stream_link(anime_url, episode, lang_lower)
        
        return {
            'title': anime_data['title'],
            'synopsis': anime_data['synopsis'],
            'image': anime_data['image'],
            'episode': episode,
            'episodes_list': episodes.get('all', []),
            'language': lang_lower.upper(),
            'stream_link': stream_link or ""
        }
