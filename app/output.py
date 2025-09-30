"""Utilities to deliver text to the active window."""
from __future__ import annotations

import logging
from typing import Optional

logger = logging.getLogger(__name__)

try:  # pragma: no cover - optional dependency
    import win32api  # type: ignore
    import win32con  # type: ignore
    import win32clipboard  # type: ignore
    import win32gui  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    win32api = None  # type: ignore
    win32con = None  # type: ignore
    win32clipboard = None  # type: ignore
    win32gui = None  # type: ignore

try:  # pragma: no cover - optional dependency
    import pyautogui
except Exception:  # pragma: no cover - optional dependency
    pyautogui = None  # type: ignore

try:  # pragma: no cover - optional dependency
    import keyboard
except Exception:  # pragma: no cover - optional dependency
    keyboard = None  # type: ignore


def sanitize_text(text: str) -> str:
    """Normalize whitespace and ensure newlines are Windows friendly."""

    lines = [" ".join(line.split()) for line in text.splitlines()]
    return "\r\n".join(lines)


def send_text(text: str) -> None:
    """Send ``text`` to the active window."""

    cleaned = sanitize_text(text)
    if win32api and win32con:
        _send_text_win32(cleaned)
    elif pyautogui:
        _paste_via_clipboard(cleaned)
    else:
        raise RuntimeError("No supported output backend available")


def _send_text_win32(text: str) -> None:  # pragma: no cover - depends on OS
    logger.debug("Sending text using SendInput")
    for ch in text:
        if keyboard:
            keyboard.write(ch)
        else:
            # Fallback to clipboard if keyboard module is unavailable
            _paste_via_clipboard(ch)


def _paste_via_clipboard(text: str) -> None:  # pragma: no cover - depends on OS
    if win32clipboard:
        win32clipboard.OpenClipboard()
        try:
            win32clipboard.EmptyClipboard()
            win32clipboard.SetClipboardText(text)
        finally:
            win32clipboard.CloseClipboard()
        if keyboard:
            keyboard.send("ctrl+v")
        elif pyautogui:
            pyautogui.hotkey("ctrl", "v")
    elif pyautogui:
        pyautogui.write(text)
    else:
        raise RuntimeError("Unable to paste text; no clipboard backend available")


def copy_to_clipboard(text: str) -> None:
    """Copy ``text`` to the system clipboard without sending it."""

    if win32clipboard:
        win32clipboard.OpenClipboard()
        try:
            win32clipboard.EmptyClipboard()
            win32clipboard.SetClipboardText(text)
        finally:
            win32clipboard.CloseClipboard()
    else:
        raise RuntimeError("win32clipboard is required to copy text explicitly")


__all__ = ["send_text", "copy_to_clipboard", "sanitize_text"]
