"""A minimal subset of NumPy required for the kata tests.

This lightweight implementation only supports the very small surface area
used within the exercises. It should not be considered a drop-in replacement
for the real NumPy package.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Iterator, List, Sequence
import struct


@dataclass(frozen=True)
class _DType:
    name: str
    struct_format: str
    itemsize: int

    def cast(self, value):  # type: ignore[override]
        if self is float32:
            return float(value)
        if self is int16:
            return int(value)
        raise TypeError(f"Unsupported dtype: {self.name}")


float32 = _DType("float32", "f", 4)
int16 = _DType("int16", "h", 2)


class ndarray:
    def __init__(self, data: Sequence[float], dtype: _DType) -> None:
        self._data: List[float] = list(data)
        self.dtype = dtype

    def astype(self, dtype: _DType) -> "ndarray":
        return ndarray([dtype.cast(x) for x in self._data], dtype)

    def flatten(self) -> "ndarray":
        return ndarray(self._data, self.dtype)

    def tolist(self) -> List[float]:
        return list(self._data)

    def __iter__(self) -> Iterator[float]:
        return iter(self._data)

    def __len__(self) -> int:
        return len(self._data)

    def __getitem__(self, item):
        return self._data[item]

    def __repr__(self) -> str:  # pragma: no cover - debugging helper
        return f"ndarray(dtype={self.dtype.name}, data={self._data!r})"

    def tobytes(self) -> bytes:
        fmt = "<" + self.dtype.struct_format * len(self._data)
        values = [self.dtype.cast(x) for x in self._data]
        return struct.pack(fmt, *values)

    def __truediv__(self, value):
        if isinstance(value, (int, float)):
            return ndarray([float(x) / float(value) for x in self._data], float32)
        raise TypeError("Unsupported division operand")


def array(sequence: Iterable[float], dtype: _DType | None = None) -> ndarray:
    dtype = dtype or float32
    return ndarray([dtype.cast(value) for value in sequence], dtype)


def frombuffer(buffer: bytes, dtype: _DType) -> ndarray:
    if len(buffer) % dtype.itemsize:
        raise ValueError("buffer size must be a multiple of element size")
    count = len(buffer) // dtype.itemsize
    if count == 0:
        return ndarray([], dtype)
    fmt = "<" + dtype.struct_format * count
    data = struct.unpack(fmt, buffer)
    return ndarray(data, dtype)


def asarray(obj, dtype: _DType | None = None) -> ndarray:
    if isinstance(obj, ndarray):
        if dtype is None or dtype is obj.dtype:
            return obj
        return obj.astype(dtype)
    return array(obj, dtype=dtype)


class _TestingModule:
    @staticmethod
    def assert_allclose(actual, desired, rtol: float = 1e-7, atol: float = 0.0) -> None:
        actual_list = _to_list(actual)
        desired_list = _to_list(desired)
        if len(actual_list) != len(desired_list):
            raise AssertionError(
                f"Lengths differ: {len(actual_list)} != {len(desired_list)}"
            )
        for index, (a, b) in enumerate(zip(actual_list, desired_list)):
            if abs(a - b) > atol + rtol * abs(b):
                raise AssertionError(
                    f"Arrays are not equal at index {index}: {a!r} != {b!r}"
                )


def _to_list(value) -> List[float]:
    if isinstance(value, ndarray):
        return value.tolist()
    if isinstance(value, (list, tuple)):
        return [float(v) for v in value]
    return [float(value)]


testing = _TestingModule()

__all__ = [
    "array",
    "asarray",
    "float32",
    "frombuffer",
    "int16",
    "ndarray",
    "testing",
]
