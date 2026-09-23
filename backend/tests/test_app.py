"""Fast, offline API and credential-boundary smoke tests."""

from fastapi.testclient import TestClient
import pytest

from app.main import app
from app.providers import get_provider_manager
from app.services.synthetic_data import SyntheticDataService


@pytest.fixture(autouse=True)
def configured_tokens(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("SILENT_CHURN_API_TOKEN", "reader-secret")
    monkeypatch.setenv("SILENT_CHURN_ADMIN_TOKEN", "admin-secret")
    monkeypatch.delenv("SILENT_CHURN_ENV", raising=False)


READ_HEADERS = {"Authorization": "Bearer reader-secret"}
ADMIN_HEADERS = {"Authorization": "Bearer admin-secret"}


def test_root_and_current_provider_are_safe() -> None:
    manager = get_provider_manager()
    manager.clear_provider()

    with TestClient(app) as client:
        assert client.get("/").status_code == 200
        response = client.get("/providers/current", headers=READ_HEADERS)

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
        response = client.post("/providers/disconnect", headers=READ_HEADERS)

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert "api_key" not in response.text


def test_customer_and_email_routes_require_authentication() -> None:
    with TestClient(app) as client:
        for path in ("/customers", "/customers/1", "/customers/1/timeline", "/customers/dashboard-stats"):
            assert client.get(path).status_code == 401
            assert client.get(path, headers={"Authorization": "Bearer wrong"}).status_code == 401
        assert client.post("/chat", json={"message": "Show emails"}).status_code == 401
        assert client.get("/providers/current", headers=ADMIN_HEADERS).status_code == 200


def test_mutations_reject_foreign_origin_and_generation_requires_admin(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    calls = []
    monkeypatch.setattr(SyntheticDataService, "generate_all_data", lambda db: calls.append(db))
    with TestClient(app) as client:
        assert client.post(
            "/generate-data", headers={**ADMIN_HEADERS, "Origin": "https://attacker.invalid"}
        ).status_code == 403
        assert client.post("/generate-data", headers=READ_HEADERS).status_code == 403
        assert not calls
        assert client.post(
            "/generate-data", headers={**ADMIN_HEADERS, "Origin": "http://localhost:5173"}
        ).status_code == 200
        assert len(calls) == 1


def test_generation_is_disabled_in_production(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("SILENT_CHURN_ENV", "production")
    with TestClient(app) as client:
        assert client.post("/generate-data", headers=ADMIN_HEADERS).status_code == 403
