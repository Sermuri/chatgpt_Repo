"""Whisper based transcription utilities."""
from __future__ import annotations

import logging
import queue
import threading
from dataclasses import dataclass
from typing import Callable, Iterable, Optional

from .audio import AudioChunk

logger = logging.getLogger(__name__)

try:  # pragma: no cover - optional dependency
    from faster_whisper import WhisperModel
except Exception:  # pragma: no cover - optional dependency
    WhisperModel = None  # type: ignore


@dataclass
class TranscriptFragment:
    text: str
    is_final: bool = False


class WhisperTranscriber:
    """Consume audio chunks and emit transcribed text fragments."""

    def __init__(
        self,
        audio_queue: queue.Queue,
        callback: Callable[[TranscriptFragment], None],
        model_path: str = "small",
        language: str = "en",
        chunk_duration: float = 2.0,
        beam_size: int = 5,
        transcription_callback: Optional[Callable[[Iterable[float]], Iterable[str]]] = None,
    ) -> None:
        self.audio_queue = audio_queue
        self.callback = callback
        self.model_path = model_path
        self.language = language
        self.chunk_duration = chunk_duration
        self.beam_size = beam_size
        self.transcription_callback = transcription_callback
        self._thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()
        self._buffer: bytearray = bytearray()
        self._sample_rate: Optional[int] = None
        self._model: Optional[WhisperModel] = None

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._run, name="WhisperTranscriber", daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop_event.set()
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=1)

    def _run(self) -> None:
        while not self._stop_event.is_set():
            try:
                chunk: AudioChunk = self.audio_queue.get(timeout=0.2)
            except queue.Empty:
                continue

            if self._sample_rate is None:
                self._sample_rate = chunk.sample_rate
            self._buffer.extend(chunk.data)

            if self._should_transcribe():
                self._transcribe_buffer()

        # Flush remaining buffer when stopping
        if self._buffer:
            self._transcribe_buffer(force_final=True)

    def _should_transcribe(self) -> bool:
        if self._sample_rate is None:
            return False
        bytes_per_second = self._sample_rate * 2  # assuming 16-bit samples
        required_bytes = int(self.chunk_duration * bytes_per_second)
        return len(self._buffer) >= required_bytes

    def _transcribe_buffer(self, force_final: bool = False) -> None:
        audio_bytes = bytes(self._buffer)
        self._buffer.clear()

        for text in self._generate_transcription(audio_bytes):
            formatted = self._format_text(text)
            fragment = TranscriptFragment(text=formatted, is_final=force_final)
            try:
                self.callback(fragment)
            except Exception:  # pragma: no cover - defensive
                logger.exception("Callback failed while delivering transcript fragment")

    def _generate_transcription(self, audio_bytes: bytes) -> Iterable[str]:
        if self.transcription_callback is not None:
            return self.transcription_callback(audio_bytes)

        if WhisperModel is None:
            logger.warning("faster-whisper is not available; no transcription will be produced")
            return []

        if self._model is None:
            self._model = WhisperModel(self.model_path, device="auto", compute_type="auto")
        segments, _info = self._model.transcribe(
            audio_bytes,
            language=self.language,
            beam_size=self.beam_size,
        )
        return (segment.text for segment in segments)

    @staticmethod
    def _format_text(text: str) -> str:
        normalized = " ".join(text.strip().split())
        return normalized.capitalize()


__all__ = ["WhisperTranscriber", "TranscriptFragment"]
