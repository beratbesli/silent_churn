from typing import List, Dict
from anthropic import AsyncAnthropic
from .base import AIProvider

class AnthropicProvider(AIProvider):
    def __init__(self, api_key: str, model_id: str = "claude-3-5-sonnet-20240620"):
        self.client = AsyncAnthropic(api_key=api_key)
        self.model_id = model_id

    @property
    def provider_name(self) -> str:
        return "anthropic"

    async def chat_completion(self, messages: List[Dict[str, str]], temperature: float = 0.7, max_tokens: int = 1000) -> str:
        system_msg = ""
        anthropic_messages = []
        
        for msg in messages:
            if msg["role"] == "system":
                system_msg += msg["content"] + "\n"
            else:
                role = "assistant" if msg["role"] == "assistant" else "user"
                anthropic_messages.append({"role": role, "content": msg["content"]})
                
        if not anthropic_messages:
            anthropic_messages.append({"role": "user", "content": "Hello"})
            
        kwargs = {
            "model": self.model_id,
            "messages": anthropic_messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        if system_msg.strip():
            kwargs["system"] = system_msg.strip()

        response = await self.client.messages.create(**kwargs)
        return response.content[0].text

    async def test_connection(self) -> bool:
        try:
            await self.client.messages.create(
                model=self.model_id,
                messages=[{"role": "user", "content": "Hi"}],
                max_tokens=5
            )
            return True
        except Exception:
            return False
