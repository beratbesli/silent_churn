from typing import List, Dict
from openai import AsyncOpenAI
from .base import AIProvider

class OpenAIProvider(AIProvider):
    def __init__(self, api_key: str, model_id: str = "gpt-4o-mini"):
        self.client = AsyncOpenAI(api_key=api_key)
        self.model_id = model_id

    @property
    def provider_name(self) -> str:
        return "openai"

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
            await self.client.models.list()
            return True
        except Exception:
            return False
