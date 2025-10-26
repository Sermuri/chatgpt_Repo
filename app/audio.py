"""Audio capture utilities."""
from __future__ import annotations

import logging
import queue
import threading
from dataclasses import dataclass
from typing import Callable, Optional

logger = logging.getLogger(__name__)

try:  # pragma: no cover - optional dependency
    import sounddevice as _sounddevice
except Exception:  # pragma: no cover - optional dependency
    _sounddevice = None

try:  # pragma: no cover - optional dependency
    import pyaudio as _pyaudio
except Exception:  # pragma: no cover - optional dependency
    _pyaudio = None


@dataclass
class AudioChunk:
    data: bytes
    sample_rate: int


class AudioStreamer:
    """Continuously capture audio chunks from the system microphone."""

    def __init__(
        self,
        queue_: Optional[queue.Queue] = None,
        sample_rate: int = 16_000,
        block_size: int = 4096,
        dtype: str = "float32",
        device: Optional[str] = None,
        backend: Optional[str] = None,
        preprocess: Optional[Callable[[bytes], bytes]] = None,
    ) -> None:
        self.queue = queue_ or queue.Queue(maxsize=10)
        self.sample_rate = sample_rate
        self.block_size = block_size
        self.dtype = dtype
        self.device = device
        self.backend = backend
        self.preprocess = preprocess
        self._thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()
        self._stream = None
        self._pa_instance = None

    def start(self) -> None:
        """Start capturing audio on a separate thread."""

        if self._thread and self._thread.is_alive():
            return
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._run, name="AudioStreamer", daemon=True)
        self._thread.start()

    def stop(self) -> None:
        """Stop capturing audio."""

        self._stop_event.set()
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=1)
        self._close_stream()

    def _close_stream(self) -> None:
        if self._stream is not None:  # pragma: no cover - depends on backend
            try:
                self._stream.stop()
            except Exception:  # pragma: no cover - defensive
                pass
            try:
                self._stream.close()
            except Exception:  # pragma: no cover - defensive
                pass
            self._stream = None
        if self._pa_instance is not None:  # pragma: no cover - depends on backend
            try:
                self._pa_instance.terminate()
            except Exception:
                pass
            self._pa_instance = None

    def _run(self) -> None:
        backend = (self.backend or "sounddevice").lower()
        if backend == "dummy":
            self._run_dummy()
        elif backend == "pyaudio":
            self._run_pyaudio()
        else:
            self._run_sounddevice()

    def _run_dummy(self) -> None:
        logger.info("AudioStreamer using dummy backend; pushing silence")
        silence = b"\x00" * self.block_size
        while not self._stop_event.is_set():
            self._enqueue_chunk(silence)
            self._stop_event.wait(0.1)

    def _run_sounddevice(self) -> None:  # pragma: no cover - requires sounddevice
        if _sounddevice is None:
            logger.warning("sounddevice not available, falling back to dummy backend")
            self._run_dummy()
            return

        def callback(indata, frames, time_info, status):
            if status:
                logger.warning("Audio callback status: %s", status)
            try:
                raw = indata.tobytes()
                self._enqueue_chunk(raw)
            except Exception:
                logger.exception("Failed to enqueue audio data")

        self._stream = _sounddevice.InputStream(
            samplerate=self.sample_rate,
            blocksize=self.block_size,
            dtype=self.dtype,
            device=self.device,
            channels=1,
            callback=callback,
        )
        with self._stream:
            while not self._stop_event.is_set():
                self._stop_event.wait(0.1)

    def _run_pyaudio(self) -> None:  # pragma: no cover - requires pyaudio
        if _pyaudio is None:
            logger.warning("pyaudio not available, falling back to dummy backend")
            self._run_dummy()
            return
        self._pa_instance = _pyaudio.PyAudio()
        stream = self._pa_instance.open(
            format=_pyaudio.paInt16,
            channels=1,
            rate=self.sample_rate,
            frames_per_buffer=self.block_size,
            input=True,
            input_device_index=None,
        )
        self._stream = stream
        while not self._stop_event.is_set():
            try:
                data = stream.read(self.block_size, exception_on_overflow=False)
                self._enqueue_chunk(data)
            except Exception:
                logger.exception("Error reading from PyAudio stream")
                break
        self._close_stream()

    def _enqueue_chunk(self, data: bytes) -> None:
        if self.preprocess:
            data = self.preprocess(data)
        chunk = AudioChunk(data=data, sample_rate=self.sample_rate)
        try:
            self.queue.put(chunk, timeout=0.5)
        except queue.Full:
            logger.warning("Audio queue is full; dropping chunk")


__all__ = ["AudioStreamer", "AudioChunk"]
