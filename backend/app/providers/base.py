import httpx
from abc import ABC, abstractmethod
from typing import List, Dict, Optional

class AIProvider(ABC):
    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @abstractmethod
    async def chat_completion(self, messages: List[Dict[str, str]], temperature: float = 0.7, max_tokens: int = 1000) -> str:
        pass

    @abstractmethod
    async def test_connection(self) -> bool:
        pass


class ProviderManager:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ProviderManager, cls).__new__(cls)
            cls._instance._current_provider = None
            cls._instance._provider_config = {
                "provider": "none",
                "is_connected": False,
                "model_name": None
            }
        return cls._instance
        
    def set_provider(self, provider: AIProvider, model_name: Optional[str] = None):
        self._current_provider = provider
        self._provider_config = {
            "provider": provider.provider_name if provider else "none",
            "is_connected": provider is not None,
            "model_name": model_name
        }
        
    def get_provider(self) -> Optional[AIProvider]:
        if self._current_provider is not None:
            return self._current_provider
            
        try:
            with httpx.Client(timeout=1.5) as client:
                r = client.get("http://localhost:1234/v1/models")
                if r.status_code == 200:
                    data = r.json()
                    models = data.get("data", [])
                    model_id = models[0]["id"] if models else "local-model"
                    from .lmstudio import LMStudioProvider
                    self._current_provider = LMStudioProvider(model_id=model_id)
                    self._provider_config = {
                        "provider": "lmstudio",
                        "is_connected": True,
                        "model_name": model_id
                    }
                    return self._current_provider
        except Exception:
            pass
            
        return None
        
    def get_current_config(self) -> dict:
        self.get_provider()
        return self._provider_config

    def clear_provider(self):
        self._current_provider = None
        self._provider_config = {
            "provider": "none",
            "is_connected": False,
            "model_name": None
        }

_provider_manager = ProviderManager()

def get_provider_manager() -> ProviderManager:
    return _provider_manager
