import numpy as np
from unittest.mock import Mock

from app.transcriber import Transcriber


def test_process_audio_sounddevice_triggers_callback_with_text():
    audio = np.array([0.1, -0.25, 0.75], dtype=np.float32)
    audio_bytes = audio.tobytes()

    model = Mock()
    model.transcribe.return_value = "hello world"
    callback = Mock()

    transcriber = Transcriber(model=model, sample_rate=16000, backend="sounddevice", callback=callback)

    result = transcriber.process_audio(audio_bytes)

    np.testing.assert_allclose(model.transcribe.call_args[0][0], audio)
    assert model.transcribe.call_args[1]["sampling_rate"] == 16000
    callback.assert_called_once_with("hello world")
    assert result == "hello world"


def test_process_audio_pyaudio_normalizes_and_triggers_callback():
    audio_int16 = np.array([0, 16384, -16384], dtype=np.int16)
    expected = audio_int16.astype(np.float32) / 32768.0
    audio_bytes = audio_int16.tobytes()

    model = Mock()
    model.transcribe.return_value = "transcribed"
    callback = Mock()

    transcriber = Transcriber(model=model, sample_rate=44100, backend="pyaudio", callback=callback)

    result = transcriber.process_audio(audio_bytes)

    np.testing.assert_allclose(model.transcribe.call_args[0][0], expected)
    assert model.transcribe.call_args[1]["sampling_rate"] == 44100
    callback.assert_called_once_with("transcribed")
    assert result == "transcribed"
