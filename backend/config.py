"""
Configuration settings for Network Impact Analyzer
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Central configuration for all AI models and APIs"""
    
    # ========================================================================
    # AI MODEL ENDPOINTS
    # ========================================================================
    
    GEMMA_ENDPOINT = "https://gemma-3-27b-3ca9s.paas.ai.telus.com"
    GEMMA_TOKEN = "dc8704d41888afb2b889a8ebac81d12f"
    
    DEEPSEEK_ENDPOINT = "https://deepseekv32-3ca9s.paas.ai.telus.com"
    DEEPSEEK_TOKEN = "a12a7d3705b12aeb46eb4cc8d77f5446"
    
    GPT_ENDPOINT = "https://rr-test-gpt-120-9219s.paas.ai.telus.com"
    GPT_TOKEN = "1df668838dee5b8410e8e21a76fd9bb9"
    
    QWEN_CODER_ENDPOINT = "https://qwen3coder30b-3ca9s.paas.ai.telus.com"
    QWEN_CODER_TOKEN = "b12e6fdc447aedf5cfce126b721e1854"
    
    QWEN_EMB_ENDPOINT = "https://qwen-emb-3ca9s.paas.ai.telus.com"
    QWEN_EMB_TOKEN = "d14ac3d17de38782334555fcc0537969"
    
    # ========================================================================
    # EXTERNAL APIS
    # ========================================================================
    
    OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "182590297e0cc91ab5a0e0ae632bae7b")
    OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5"
    
    # ========================================================================
    # SYSTEM SETTINGS
    # ========================================================================
    
    # API limits
    MAX_SEARCH_QUERIES = 5
    REQUEST_TIMEOUT = 30  # seconds (web search, weather, etc.)
    AI_REQUEST_TIMEOUT = 120  # seconds for model calls (Gemma, DeepSeek, GPT)
    
    # Caching
    CACHE_TTL = 300  # 5 minutes in seconds
    
    # Analysis limits
    MAX_AREAS_RETURNED = 10
    MIN_CONFIDENCE_THRESHOLD = 0.65
    
    # Flask settings
    FLASK_HOST = "0.0.0.0"
    FLASK_PORT = int(os.getenv("PORT", 5001))  # Use PORT env var for production (default 5001)
    FLASK_DEBUG = os.getenv("FLASK_DEBUG", "False").lower() == "true"  # Disable debug in production
    
    # ========================================================================
    # MODEL PARAMETERS
    # ========================================================================
    
    # Default temperature settings for different agents
    TEMPERATURE_EVENT_INTELLIGENCE = 0.3  # Lower = more focused
    TEMPERATURE_WEB_INTELLIGENCE = 0.5
    TEMPERATURE_GEOSPATIAL_REASONING = 0.4
    
    # Token limits
    MAX_TOKENS_EVENT_INTELLIGENCE = 1000
    MAX_TOKENS_WEB_INTELLIGENCE = 1500
    MAX_TOKENS_GEOSPATIAL_REASONING = 3000