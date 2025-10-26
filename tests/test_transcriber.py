from __future__ import annotations

import queue
from typing import Iterable, List

from app.audio import AudioChunk
from app.transcriber import TranscriptFragment, WhisperTranscriber


def dummy_transcription(_: Iterable[float]) -> Iterable[str]:
    yield "hello world"
    yield "this is a test"


def test_transcriber_emits_formatted_fragments(monkeypatch) -> None:
    audio_queue: queue.Queue[AudioChunk] = queue.Queue()
    fragments: List[TranscriptFragment] = []

    def callback(fragment: TranscriptFragment) -> None:
        fragments.append(fragment)

    transcriber = WhisperTranscriber(
        audio_queue=audio_queue,
        callback=callback,
        transcription_callback=dummy_transcription,
        chunk_duration=0.0,
    )

    audio_queue.put(AudioChunk(data=b"\x00" * 10, sample_rate=16000))
    transcriber._transcribe_buffer(force_final=True)

    assert len(fragments) == 2
    assert fragments[0].text == "Hello world"
    assert fragments[1].is_final
