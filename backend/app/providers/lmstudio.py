import httpx
from typing import List, Dict
from .base import AIProvider

class LMStudioProvider(AIProvider):
    def __init__(self, base_url: str = "http://localhost:1234/v1", model_id: str = "local-model"):
        self.base_url = base_url
        self.model_id = model_id

    @property
    def provider_name(self) -> str:
        return "lmstudio"

    async def chat_completion(self, messages: List[Dict[str, str]], temperature: float = 0.7, max_tokens: int = 1000) -> str:
        async with httpx.AsyncClient(timeout=120.0) as client:
            payload = {
                "model": self.model_id,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            response = await client.post(f"{self.base_url}/chat/completions", json=payload)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    async def test_connection(self) -> bool:
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(f"{self.base_url}/models")
                response.raise_for_status()
                return True
            except Exception:
                return False

    async def list_models(self) -> List[str]:
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(f"{self.base_url}/models")
                response.raise_for_status()
                data = response.json()
                return [model["id"] for model in data.get("data", [])]
            except Exception:
                return []
