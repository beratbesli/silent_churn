"""Fast, offline API and credential-boundary smoke tests."""

from fastapi.testclient import TestClient

from app.main import app
from app.providers import get_provider_manager


def test_root_and_current_provider_are_safe() -> None:
    manager = get_provider_manager()
    manager.clear_provider()

    with TestClient(app) as client:
        assert client.get("/").status_code == 200
        response = client.get("/providers/current")

    assert response.status_code == 200
    assert response.json() == {
        "provider": "none",
        "is_connected": False,
        "model_name": None,
    }


def test_disconnect_is_idempotent_and_does_not_expose_credentials() -> None:
    manager = get_provider_manager()
    manager.clear_provider()

    with TestClient(app) as client:
        response = client.post("/providers/disconnect")

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert "api_key" not in response.text
