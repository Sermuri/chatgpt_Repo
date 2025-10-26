"""Application configuration handling."""
from __future__ import annotations

from dataclasses import dataclass, field, fields
from pathlib import Path
from typing import Any, Dict, Optional

import json
import threading

_DEFAULT_CONFIG_PATH = Path.home() / ".live_transcriber" / "config.json"


def _ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


@dataclass
class AppConfig:
    """Dataclass that stores runtime configuration for the application."""

    language: str = "en"
    model_path: str = "small"
    audio_device: Optional[str] = None
    sample_rate: int = 16000
    block_size: int = 4096
    push_to_talk_key: str = "alt+space"
    enable_tray: bool = True
    enable_telemetry: bool = False
    telemetry_endpoint: Optional[str] = None
    audio_backend: Optional[str] = None
    extra: Dict[str, Any] = field(default_factory=dict)

    _lock: threading.RLock = field(default_factory=threading.RLock, init=False, repr=False)

    @classmethod
    def load(cls, path: Optional[Path] = None) -> "AppConfig":
        """Load configuration from ``path``.

        If the file does not exist an instance with default values is returned and
        stored on disk so that users can edit it later.
        """

        config_path = path or _DEFAULT_CONFIG_PATH
        if not config_path.exists():
            config = cls()
            config.save(config_path)
            return config

        with config_path.open("r", encoding="utf-8") as fp:
            raw_data = json.load(fp)

        supported = {field.name for field in cls.__dataclass_fields__.values() if field.init}
        data: Dict[str, Any] = {k: v for k, v in raw_data.items() if k in supported}
        extra = {k: v for k, v in raw_data.items() if k not in supported}
        config = cls(**data)
        config.extra.update(extra)
        return config

    def save(self, path: Optional[Path] = None) -> None:
        """Persist configuration to ``path``."""

        config_path = path or _DEFAULT_CONFIG_PATH
        _ensure_parent(config_path)
        with self._lock, config_path.open("w", encoding="utf-8") as fp:
            json.dump(self.to_dict(), fp, indent=2, sort_keys=True)

    def to_dict(self) -> Dict[str, Any]:
        """Return a dict representation suitable for JSON serialization."""

        data: Dict[str, Any] = {}
        for f in fields(self):
            if f.name == "_lock":
                continue
            data[f.name] = getattr(self, f.name)
        data.update(self.extra)
        return data

    def update(self, **kwargs: Any) -> None:
        """Update configuration fields while keeping thread-safety."""

        with self._lock:
            for key, value in kwargs.items():
                if hasattr(self, key):
                    setattr(self, key, value)
                else:
                    self.extra[key] = value


__all__ = ["AppConfig", "_DEFAULT_CONFIG_PATH"]
