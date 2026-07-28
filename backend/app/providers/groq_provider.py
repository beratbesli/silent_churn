from typing import List, Dict
from groq import AsyncGroq
from .base import AIProvider

class GroqProvider(AIProvider):
    def __init__(self, api_key: str, model_id: str = "llama-3.1-8b-instant"):
        self.client = AsyncGroq(api_key=api_key)
        self.model_id = model_id

    @property
    def provider_name(self) -> str:
        return "groq"

    async def chat_completion(self, messages: List[Dict[str, str]], temperature: float = 0.7, max_tokens: int = 1000) -> str:
        response = await self.client.chat.completions.create(
            model=self.model_id,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        )
        return response.choices[0].message.content

    async def test_connection(self) -> bool:
        try:
            await self.client.chat.completions.create(
                model=self.model_id,
                messages=[{"role": "user", "content": "Hi"}],
                max_tokens=5
            )
            return True
        except Exception:
            return False
