from __future__ import annotations

from app.output import sanitize_text


def test_sanitize_text_normalizes_whitespace() -> None:
    raw = "Hello   world\nnext line"
    sanitized = sanitize_text(raw)
    assert sanitized == "Hello world\r\nnext line"
