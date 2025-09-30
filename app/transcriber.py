"""Utilities for transcribing audio streams."""
from __future__ import annotations

from typing import Callable, Optional

import numpy as np


class Transcriber:
    """Simple audio transcriber that normalizes audio buffers before inference."""

    def __init__(
        self,
        model: object,
        sample_rate: int,
        backend: str,
        callback: Optional[Callable[[str], None]] = None,
    ) -> None:
        self._model = model
        self._sample_rate = sample_rate
        self._backend = backend or ""
        self._callback = callback

    def process_audio(self, audio_bytes: bytes) -> str:
        """Convert raw audio bytes and forward them to the transcription model.

        Args:
            audio_bytes: Raw PCM audio data as bytes.

        Returns:
            The text returned by the transcription model.
        """
        backend = self._backend.lower()
        dtype = np.float32 if backend == "sounddevice" else np.int16

        audio_array = np.frombuffer(audio_bytes, dtype=dtype)

        if dtype == np.int16:
            normalized = audio_array.astype(np.float32) / 32768.0
        else:
            normalized = np.asarray(audio_array, dtype=np.float32)

        normalized = normalized.flatten()

        text = self._model.transcribe(normalized, sampling_rate=self._sample_rate)

        if self._callback is not None:
            self._callback(text)

        return text
