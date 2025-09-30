"""Audio streaming utilities for the transcription pipeline."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


@dataclass
class AudioChunk:
    """A chunk of audio data prepared for transcription.

    Attributes
    ----------
    data:
        Raw audio payload in bytes.
    sample_rate:
        The sampling frequency of the audio payload.
    bytes_per_sample:
        Number of bytes used to encode a single audio sample.  For PCM
        data this is typically ``2`` (``int16``) but formats such as
        ``float32`` use ``4``.
    """

    data: bytes
    sample_rate: int
    bytes_per_sample: int

    @property
    def duration_seconds(self) -> float:
        """Return the duration of the chunk in seconds."""
        if self.sample_rate <= 0 or self.bytes_per_sample <= 0:
            return 0.0
        return len(self.data) / (self.sample_rate * self.bytes_per_sample)


class AudioStreamer:
    """Collect raw audio payloads into :class:`AudioChunk` instances."""

    def __init__(self, sample_rate: int, bytes_per_sample: int = 2) -> None:
        self.sample_rate = sample_rate
        self.bytes_per_sample = bytes_per_sample
        self._buffer = bytearray()

    def push(self, data: bytes, *, bytes_per_sample: Optional[int] = None) -> None:
        """Append new audio ``data`` to the internal buffer.

        Parameters
        ----------
        data:
            Raw audio payload to append to the buffer.
        bytes_per_sample:
            Optional override for the bytes per sample of the payload.
            When supplied it will also update the format for future
            chunks.  This allows callers to dynamically change audio
            formats (for instance ``int16`` -> ``float32``).
        """

        if bytes_per_sample is not None:
            if bytes_per_sample <= 0:
                raise ValueError("bytes_per_sample must be greater than zero")
            self.bytes_per_sample = bytes_per_sample
        self._buffer.extend(data)

    def flush(self) -> AudioChunk:
        """Create a chunk from the buffered audio data and reset the buffer."""
        chunk = AudioChunk(
            data=bytes(self._buffer),
            sample_rate=self.sample_rate,
            bytes_per_sample=self.bytes_per_sample,
        )
        self._buffer.clear()
        return chunk
