"""System tray controller for the speech-to-text application."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable, Optional


@dataclass
class SystemTrayController:
    """Simple system tray controller abstraction.

    The controller exposes a callback that is invoked when the tray requests
    the listening mode to toggle. This simplified version keeps track of the
    latest activation state so that the rest of the application can remain in
    sync with the tray icon.
    """

    on_toggle: Optional[Callable[[bool], None]] = None
    _is_listening: bool = field(default=False, init=False)

    def set_listening_state(self, active: bool) -> None:
        """Persist the activation state for the tray icon.

        Parameters
        ----------
        active:
            ``True`` when the microphone should be marked as active, ``False``
            otherwise.
        """

        self._is_listening = active

    def request_toggle(self) -> None:
        """Simulate a toggle request coming from the system tray."""

        if self.on_toggle is not None:
            self.on_toggle(not self._is_listening)

    @property
    def is_listening(self) -> bool:
        """Return the activation state currently reflected in the tray."""

        return self._is_listening
