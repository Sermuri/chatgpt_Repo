import pathlib
import sys

# Ensure the repository root is on the import path when tests are executed
# from an arbitrary working directory.
ROOT = pathlib.Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.audio import AudioStreamer
from app.transcriber import WhisperTranscriber


def test_transcriber_respects_bytes_per_sample_for_float32():
    sample_rate = 16000
    chunk_duration = 1.0
    bytes_per_sample = 4  # float32

    streamer = AudioStreamer(sample_rate=sample_rate, bytes_per_sample=bytes_per_sample)
    transcriber = WhisperTranscriber(
        chunk_duration=chunk_duration,
        sample_rate=sample_rate,
        bytes_per_sample=bytes_per_sample,
    )

    # Less than one second of audio should not trigger transcription.
    almost_one_second = bytes_per_sample * sample_rate - 10
    streamer.push(b"0" * almost_one_second)
    chunk = streamer.flush()
    assert not transcriber._should_transcribe(chunk)

    # Exactly one second of audio should now be enough.
    streamer.push(b"1" * (bytes_per_sample * sample_rate))
    chunk = streamer.flush()
    assert transcriber._should_transcribe(chunk)
