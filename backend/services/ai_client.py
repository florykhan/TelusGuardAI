"""
Unified AI model client for all endpoint calls
"""

import aiohttp
import asyncio
import time
from typing import Optional
from config import Config
from utils.logger import logger


class ModelTimeoutError(Exception):
    """Raised when the model API call times out after retries."""


class AIModelClient:
    """
    Unified client for making calls to AI model endpoints
    Supports Telus OpenAI-compatible gateway endpoints
    """
    
    @staticmethod
    async def call_model(
        endpoint: str,
        token: str,
        prompt: str,
        max_tokens: int = 2000,
        temperature: float = 0.7,
        system_prompt: Optional[str] = None,
        max_retries: int = 3,
        use_chat: bool = True
    ) -> str:
        """
        Make async call to AI model endpoint with retry logic
        
        Args:
            endpoint: Model endpoint URL
            token: Authentication token
            prompt: User prompt
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature (0-1)
            system_prompt: Optional system/instruction prompt
            max_retries: Number of retry attempts on failure
        
        Returns:
            Generated text response from model
        """
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # Construct messages for chat completions format
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        # Construct payload - NO MODEL FIELD for Telus gateway
        payload = {
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        if use_chat:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            payload = {
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
            }
            url = f"{endpoint}/v1/chat/completions"
        else:
            payload = {
                "model": "gpt-oss-120b",
                "prompt": prompt,
                "max_tokens": max_tokens,
                "temperature": temperature,
            }
            url = f"{endpoint}/v1/completions"
        
        # Retry loop with detailed logging
        any_timeout = False
        start_time = time.time()
        logger.info(f"🚀 Starting LLM call to {endpoint} (timeout: {Config.AI_REQUEST_TIMEOUT}s, max_retries: {max_retries})")
        
        for attempt in range(max_retries):
            attempt_start = time.time()
            try:
                connector = aiohttp.TCPConnector(ssl=False)
                async with aiohttp.ClientSession(connector=connector) as session:
                    logger.info(f"📡 LLM call attempt {attempt + 1}/{max_retries} starting...")
                    async with session.post(
                        url,
                        json=payload,
                        headers=headers,
                        timeout=aiohttp.ClientTimeout(total=Config.AI_REQUEST_TIMEOUT)
                    ) as response:
                        elapsed = time.time() - attempt_start
                        logger.info(f"📥 LLM response received (status: {response.status}, elapsed: {elapsed:.2f}s)")
                        
                        if response.status == 200:
                            data = await response.json()
                            if use_chat:
                                text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                            else:
                                text = data.get("choices", [{}])[0].get("text", "")
                            
                            total_elapsed = time.time() - start_time
                            if text:
                                logger.info(f"✅ Model call successful ({len(text)} chars, total elapsed: {total_elapsed:.2f}s)")
                                return text
                            else:
                                logger.warning("⚠️  Empty response from model")
                                
                        else:
                            error_text = await response.text()
                            logger.error(
                                f"❌ Model API error: {response.status} - {error_text[:200]}"
                            )
                
            except (GeneratorExit, asyncio.CancelledError) as e:
                elapsed = time.time() - attempt_start
                logger.warning(f"🛑 LLM call cancelled (attempt {attempt + 1}, elapsed: {elapsed:.2f}s)")
                raise
            except asyncio.TimeoutError:
                any_timeout = True
                elapsed = time.time() - attempt_start
                logger.warning(f"⏰ Timeout on attempt {attempt + 1}/{max_retries} (elapsed: {elapsed:.2f}s)")
                if attempt < max_retries - 1:
                    backoff = 2 ** attempt
                    logger.info(f"⏳ Retrying in {backoff}s...")
                    await asyncio.sleep(backoff)
                    
            except aiohttp.ClientError as e:
                elapsed = time.time() - attempt_start
                logger.error(f"🔌 Connection error on attempt {attempt + 1} (elapsed: {elapsed:.2f}s): {str(e)}")
                if attempt < max_retries - 1:
                    backoff = 2 ** attempt
                    logger.info(f"⏳ Retrying in {backoff}s...")
                    await asyncio.sleep(backoff)
                    
            except Exception as e:
                elapsed = time.time() - attempt_start
                logger.error(f"💥 Unexpected error on attempt {attempt + 1} (elapsed: {elapsed:.2f}s): {str(e)}")
                if attempt < max_retries - 1:
                    backoff = 2 ** attempt
                    logger.info(f"⏳ Retrying in {backoff}s...")
                    await asyncio.sleep(backoff)
        
        total_elapsed = time.time() - start_time
        if any_timeout:
            logger.error(f"❌ Model call timed out after {max_retries} attempts (timeout: {Config.AI_REQUEST_TIMEOUT}s each, total elapsed: {total_elapsed:.2f}s)")
            raise ModelTimeoutError(
                f"AI model request timed out after {max_retries} attempts "
                f"(timeout {Config.AI_REQUEST_TIMEOUT}s per attempt, total elapsed: {total_elapsed:.2f}s)."
            )
        logger.error(f"❌ All {max_retries} attempts failed (total elapsed: {total_elapsed:.2f}s)")
        return ""
    
    @staticmethod
    async def call_gemma(
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = Config.TEMPERATURE_EVENT_INTELLIGENCE,
        max_tokens: int = Config.MAX_TOKENS_EVENT_INTELLIGENCE
    ) -> str:
        """
        Call Gemma-3-27b model
        Used for: Event Intelligence (query parsing)
        """
        return await AIModelClient.call_model(
            endpoint=Config.GEMMA_ENDPOINT,
            token=Config.GEMMA_TOKEN,
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=temperature,
            max_tokens=max_tokens
        )
    
    @staticmethod
    async def call_deepseek(
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = Config.TEMPERATURE_WEB_INTELLIGENCE,
        max_tokens: int = Config.MAX_TOKENS_WEB_INTELLIGENCE
    ) -> str:
        """
        Call DeepSeek-v3-2 model
        Used for: Web Intelligence (data aggregation)
        """
        return await AIModelClient.call_model(
            endpoint=Config.DEEPSEEK_ENDPOINT,
            token=Config.DEEPSEEK_TOKEN,
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=temperature,
            max_tokens=max_tokens
        )
    
    @staticmethod
    async def call_gpt(
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = Config.TEMPERATURE_GEOSPATIAL_REASONING,
        max_tokens: int = Config.MAX_TOKENS_GEOSPATIAL_REASONING
    ) -> str:
        """
        Call GPT-OSS-120b model
        Used for: Geospatial Reasoning (impact analysis)
        """
        return await AIModelClient.call_model(
            endpoint=Config.GPT_ENDPOINT,
            token=Config.GPT_TOKEN,
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            use_chat=False
        )
    
    @staticmethod
    async def call_qwen_coder(
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 1000
    ) -> str:
        """
        Call Qwen3Coder-30b model
        Used for: Code generation and technical tasks
        """
        return await AIModelClient.call_model(
            endpoint=Config.QWEN_CODER_ENDPOINT,
            token=Config.QWEN_CODER_TOKEN,
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=temperature,
            max_tokens=max_tokens
        )