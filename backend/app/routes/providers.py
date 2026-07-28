from fastapi import APIRouter, HTTPException
from typing import List

from app.schemas import ProviderConfig, ProviderConnectRequest, ProviderConnectResponse
from app.providers import get_provider_manager
from app.providers.lmstudio import LMStudioProvider
from app.providers.openai_provider import OpenAIProvider
from app.providers.anthropic_provider import AnthropicProvider
from app.providers.groq_provider import GroqProvider

router = APIRouter(prefix="/providers", tags=["providers"])

@router.get("/local-models", response_model=List[str])
async def get_local_models():
    provider = LMStudioProvider()
    models = await provider.list_models()
    return models

@router.get("/current", response_model=ProviderConfig)
def get_current_provider():
    manager = get_provider_manager()
    return manager.get_current_config()

@router.post("/connect", response_model=ProviderConnectResponse)
async def connect_provider(req: ProviderConnectRequest):
    manager = get_provider_manager()
    provider_type = req.provider.lower()
    
    provider = None
    if provider_type == "lmstudio":
        model_id = req.model_id or "local-model"
        provider = LMStudioProvider(model_id=model_id)
    elif provider_type == "openai":
        if not req.api_key:
            raise HTTPException(status_code=400, detail="API key required for OpenAI")
        provider = OpenAIProvider(api_key=req.api_key, model_id=req.model_id or "gpt-4o-mini")
    elif provider_type == "anthropic":
        if not req.api_key:
            raise HTTPException(status_code=400, detail="API key required for Anthropic")
        provider = AnthropicProvider(api_key=req.api_key, model_id=req.model_id or "claude-3-5-sonnet-20240620")
    elif provider_type == "groq":
        if not req.api_key:
            raise HTTPException(status_code=400, detail="API key required for Groq")
        provider = GroqProvider(api_key=req.api_key, model_id=req.model_id or "llama-3.1-8b-instant")
    else:
        raise HTTPException(status_code=400, detail=f"Unknown provider type: {provider_type}")

    is_valid = await provider.test_connection()
    if is_valid:
        manager.set_provider(provider, req.model_id)
        return {"success": True, "message": f"Successfully connected to {provider_type}", "provider": provider_type}
    else:
        return {"success": False, "message": f"Failed to connect to {provider_type}. Check credentials/server.", "provider": provider_type}

@router.post("/disconnect")
def disconnect_provider():
    manager = get_provider_manager()
    manager.clear_provider()
    return {"success": True, "message": "Provider disconnected"}
