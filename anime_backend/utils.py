import re
from typing import List, Optional


def normalize_anime_name(name: str) -> str:
    """
    Normalize anime name: lowercase, remove special chars, replace spaces with dashes
    Example: "Solo Leveling" -> "solo-leveling"
    """
    name = name.lower().strip()
    name = re.sub(r'[^\w\s-]', '', name)  # Remove special characters
    name = re.sub(r'\s+', '-', name)  # Replace spaces with dashes
    name = re.sub(r'-+', '-', name)  # Replace multiple dashes with single dash
    return name.strip('-')


def sanitize_synopsis(text: str, max_length: int = 500) -> str:
    """Clean up synopsis text"""
    if not text:
        return ""
    text = text.strip()
    text = re.sub(r'\s+', ' ', text)  # Remove extra whitespace
    if len(text) > max_length:
        text = text[:max_length].rsplit(' ', 1)[0] + "..."
    return text


def extract_episode_numbers(episode_list: List[str]) -> List[int]:
    """Extract episode numbers from list of strings"""
    episodes = []
    for item in episode_list:
        match = re.search(r'\d+', item)
        if match:
            ep_num = int(match.group())
            if ep_num not in episodes:
                episodes.append(ep_num)
    return sorted(episodes)


def validate_episode_number(episode: int) -> bool:
    """Validate episode number"""
    return isinstance(episode, int) and episode > 0


def validate_language(language: str) -> bool:
    """Validate language code"""
    return language.lower() in ['vf', 'vostfr']


def normalize_language(language: str) -> str:
    """Normalize language to uppercase"""
    return language.upper() if language else "VOSTFR"
