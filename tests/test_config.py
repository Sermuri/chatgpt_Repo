from __future__ import annotations

from pathlib import Path

from app.config import AppConfig


def test_load_and_save_roundtrip(tmp_path: Path) -> None:
    config_path = tmp_path / "config.json"
    config = AppConfig.load(config_path)
    assert config.language == "en"
    config.update(language="es", telemetry_endpoint="https://example.com")
    config.save(config_path)

    loaded = AppConfig.load(config_path)
    assert loaded.language == "es"
    assert loaded.telemetry_endpoint == "https://example.com"


def test_to_dict_includes_extra(tmp_path: Path) -> None:
    config = AppConfig()
    config.update(custom="value")
    data = config.to_dict()
    assert data["language"] == "en"
    assert data["custom"] == "value"
