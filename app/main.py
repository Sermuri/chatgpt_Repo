"""Application entry point."""
from __future__ import annotations

import logging
import queue
import signal
import sys
import threading
from dataclasses import dataclass
from typing import Optional

from . import output
from .audio import AudioStreamer
from .config import AppConfig
from .transcriber import TranscriptFragment, WhisperTranscriber

logger = logging.getLogger(__name__)

try:  # pragma: no cover - optional dependency
    import keyboard
except Exception:  # pragma: no cover - optional dependency
    keyboard = None  # type: ignore

try:  # pragma: no cover - optional dependency
    from PySide6 import QtGui, QtWidgets
except Exception:  # pragma: no cover - optional dependency
    QtGui = None  # type: ignore
    QtWidgets = None  # type: ignore


@dataclass
class TrayState:
    recording: bool


class SystemTrayController:
    """Lightweight system tray indicator using PySide6 when available."""

    def __init__(self, title: str = "Live Transcriber") -> None:
        self.title = title
        self._app: Optional[QtWidgets.QApplication] = None
        self._icon: Optional[QtWidgets.QSystemTrayIcon] = None
        self._thread: Optional[threading.Thread] = None
        self._state = TrayState(recording=False)

    def start(self) -> None:  # pragma: no cover - GUI heavy
        if QtWidgets is None:
            logger.info("PySide6 not available; tray icon disabled")
            return
        if self._thread and self._thread.is_alive():
            return
        self._thread = threading.Thread(target=self._run, name="TrayController", daemon=True)
        self._thread.start()

    def _run(self) -> None:  # pragma: no cover - GUI heavy
        self._app = QtWidgets.QApplication.instance() or QtWidgets.QApplication(sys.argv)
        self._icon = QtWidgets.QSystemTrayIcon(QtGui.QIcon())
        self._icon.setToolTip(self.title)
        self._icon.show()
        self._app.exec()

    def update(self, state: TrayState) -> None:
        self._state = state
        if self._icon is not None:  # pragma: no cover - GUI heavy
            tooltip = f"Live Transcriber - {'Recording' if state.recording else 'Idle'}"
            self._icon.setToolTip(tooltip)

    def stop(self) -> None:  # pragma: no cover - GUI heavy
        if self._icon is not None:
            self._icon.hide()
        if self._app is not None:
            self._app.quit()
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=1)


class SpeechToTextApp:
    """Top-level coordinator for the live transcription workflow."""

    def __init__(self, config: Optional[AppConfig] = None) -> None:
        self.config = config or AppConfig.load()
        self.audio_queue: queue.Queue = queue.Queue(maxsize=25)
        self.streamer = AudioStreamer(
            queue_=self.audio_queue,
            sample_rate=self.config.sample_rate,
            block_size=self.config.block_size,
            device=self.config.audio_device,
            backend=self.config.audio_backend,
        )
        self.transcriber = WhisperTranscriber(
            audio_queue=self.audio_queue,
            callback=self._handle_transcript,
            model_path=self.config.model_path,
            language=self.config.language,
        )
        self.tray = SystemTrayController()
        self._active = threading.Event()
        self._shutdown = threading.Event()
        self._register_signal_handlers()

    def _register_signal_handlers(self) -> None:
        signal.signal(signal.SIGINT, self._handle_signal)
        signal.signal(signal.SIGTERM, self._handle_signal)

    def _handle_signal(self, signum, frame) -> None:
        logger.info("Received signal %s; stopping application", signum)
        self.stop()

    def _handle_transcript(self, fragment: TranscriptFragment) -> None:
        if not self._active.is_set():
            logger.debug("Ignoring transcript while inactive: %s", fragment.text)
            return
        output.send_text(fragment.text)
        if fragment.is_final:
            logger.info("Final transcript delivered: %s", fragment.text)

    def _toggle_activation(self) -> None:
        if self._active.is_set():
            logger.info("Deactivating push-to-talk")
            self._active.clear()
            self.tray.update(TrayState(recording=False))
        else:
            logger.info("Activating push-to-talk")
            self._active.set()
            self.tray.update(TrayState(recording=True))

    def start(self) -> None:
        logger.info("Starting SpeechToTextApp")
        self.streamer.start()
        self.transcriber.start()
        self.tray.start()
        if keyboard:
            keyboard.add_hotkey(self.config.push_to_talk_key, self._toggle_activation)
        else:
            logger.warning("keyboard module not available; transcription always active")
            self._active.set()
            self.tray.update(TrayState(recording=True))

    def stop(self) -> None:
        if self._shutdown.is_set():
            return
        self._shutdown.set()
        if keyboard:
            try:
                keyboard.remove_hotkey(self.config.push_to_talk_key)
            except Exception:  # pragma: no cover - defensive
                logger.exception("Failed to remove hotkey")
        self.streamer.stop()
        self.transcriber.stop()
        self.tray.stop()

    def run(self) -> None:
        self.start()
        logger.info("Application running. Press Ctrl+C to exit.")
        try:
            while not self._shutdown.is_set():
                self._shutdown.wait(0.5)
        finally:
            self.stop()


__all__ = ["SpeechToTextApp", "SystemTrayController", "TrayState"]
