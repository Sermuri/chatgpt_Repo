"""User interface for the speech-to-text application."""

from __future__ import annotations

from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QHBoxLayout,
    QLabel,
    QMainWindow,
    QPushButton,
    QVBoxLayout,
    QWidget,
)


class MainWindow(QMainWindow):
    """Main application window with status indicators and controls."""

    toggle_activation_requested = Signal()

    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("Speech to Text")

        self._listening_label = QLabel("Escuchando: OFF")
        self._transcribing_label = QLabel("Transcribiendo: OFF")
        self._status_container = QWidget()

        status_layout = QHBoxLayout(self._status_container)
        status_layout.addWidget(self._listening_label)
        status_layout.addWidget(self._transcribing_label)
        status_layout.setAlignment(Qt.AlignmentFlag.AlignCenter)

        self._toggle_button = QPushButton("Escuchar OFF")
        self._toggle_button.setCheckable(True)
        self._toggle_button.clicked.connect(
            lambda _checked: self.toggle_activation_requested.emit()
        )

        central_widget = QWidget()
        layout = QVBoxLayout(central_widget)
        layout.addWidget(self._status_container)
        layout.addWidget(self._toggle_button)
        layout.addStretch()
        layout.setAlignment(self._status_container, Qt.AlignmentFlag.AlignCenter)
        layout.setAlignment(self._toggle_button, Qt.AlignmentFlag.AlignCenter)

        self.setCentralWidget(central_widget)

    def set_listening_indicator(self, active: bool) -> None:
        """Update the listening indicator label."""

        state = "ON" if active else "OFF"
        self._listening_label.setText(f"Escuchando: {state}")
        self._apply_label_style(self._listening_label, active)

    def set_transcribing_indicator(self, active: bool) -> None:
        """Update the transcribing indicator label."""

        state = "ON" if active else "OFF"
        self._transcribing_label.setText(f"Transcribiendo: {state}")
        self._apply_label_style(self._transcribing_label, active)

    def set_toggle_button_state(self, active: bool) -> None:
        """Reflect the listening state on the toggle button text and state."""

        self._toggle_button.setChecked(active)
        self._toggle_button.setText("Escuchar ON" if active else "Escuchar OFF")

    @staticmethod
    def _apply_label_style(label: QLabel, active: bool) -> None:
        color = "#27ae60" if active else "#7f8c8d"
        label.setStyleSheet(f"color: {color}; font-weight: bold;")
