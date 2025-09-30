"""Application entry point and orchestration logic."""

from __future__ import annotations

import sys
from typing import Optional

from PySide6.QtWidgets import QApplication

from .system_tray import SystemTrayController
from .ui import MainWindow


class SpeechToTextApp:
    """High level controller for the speech-to-text application."""

    def __init__(self, system_tray: Optional[SystemTrayController] = None) -> None:
        self._qt_app: Optional[QApplication] = None
        self._window: Optional[MainWindow] = None
        self._active: bool = False
        self._is_transcribing: bool = False
        self._system_tray = system_tray or SystemTrayController()
        self._system_tray.on_toggle = self._handle_tray_toggle

    @property
    def system_tray(self) -> SystemTrayController:
        """Expose the system tray controller instance."""

        return self._system_tray

    def start(self) -> int:
        """Instantiate the UI and start the Qt event loop."""

        if QApplication.instance() is not None:
            self._qt_app = QApplication.instance()
        else:
            self._qt_app = QApplication(sys.argv)

        self._window = MainWindow()
        self._window.toggle_activation_requested.connect(self._toggle_activation)
        self._refresh_view()
        self._window.show()

        return self._qt_app.exec()

    def _refresh_view(self) -> None:
        if self._window is None:
            return

        self._window.set_toggle_button_state(self._active)
        self._window.set_listening_indicator(self._active)
        self._window.set_transcribing_indicator(self._is_transcribing)
        self._system_tray.set_listening_state(self._active)

    def _toggle_activation(self) -> None:
        """Toggle the listening activation state."""

        self._set_activation_state(not self._active)

    def _set_activation_state(self, active: bool) -> None:
        if self._active == active:
            return

        self._active = active
        if not active:
            self._is_transcribing = False
        self._refresh_view()

    def set_transcribing(self, active: bool) -> None:
        """Public hook to reflect the transcription state in the UI."""

        if self._is_transcribing == active:
            return

        self._is_transcribing = active
        if active:
            self._active = True
        self._refresh_view()

    def _handle_tray_toggle(self, desired_state: bool) -> None:
        """Callback invoked when the system tray requests a state change."""

        self._set_activation_state(desired_state)


__all__ = ["SpeechToTextApp"]
