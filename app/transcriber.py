"""Transcription helpers built around the Whisper model."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from .audio import AudioChunk


@dataclass
class TranscriptionResult:
    """Simple container with the transcription outcome."""

    text: str


class WhisperTranscriber:
    """A minimal transcriber that chunks audio before transcription."""

    def __init__(
        self,
        *,
        chunk_duration: float,
        sample_rate: int,
        bytes_per_sample: int = 2,
    ) -> None:
        if chunk_duration <= 0:
            raise ValueError("chunk_duration must be positive")
        if sample_rate <= 0:
            raise ValueError("sample_rate must be positive")
        if bytes_per_sample <= 0:
            raise ValueError("bytes_per_sample must be positive")

        self.chunk_duration = float(chunk_duration)
        self.sample_rate = sample_rate
        self.bytes_per_sample = bytes_per_sample

    def _required_bytes(self, chunk: Optional[AudioChunk] = None) -> int:
        """Return how many bytes of audio are required before decoding."""
        bytes_per_sample = self.bytes_per_sample
        sample_rate = self.sample_rate

        if chunk is not None:
            bytes_per_sample = chunk.bytes_per_sample or bytes_per_sample
            sample_rate = chunk.sample_rate or sample_rate

        return int(round(self.chunk_duration * sample_rate * bytes_per_sample))

    def _should_transcribe(self, chunk: AudioChunk) -> bool:
        """Return whether the chunk contains enough data for transcription."""
        required_bytes = self._required_bytes(chunk)
        return len(chunk.data) >= required_bytes

    def transcribe(self, chunk: AudioChunk) -> Optional[TranscriptionResult]:
        """Fake transcription method.

        The method returns ``None`` until enough audio has been gathered
        to cover ``chunk_duration`` seconds.  Once the target duration is
        reached it returns a dummy :class:`TranscriptionResult` instance.
        """

        if not self._should_transcribe(chunk):
            return None
        # We return a placeholder result because the focus of the kata is
        # validating chunk duration handling.  A real implementation would
        # call a Whisper model here.
        return TranscriptionResult(text="(transcription placeholder)")
