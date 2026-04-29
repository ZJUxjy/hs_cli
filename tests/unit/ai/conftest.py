"""Test configuration for AI unit tests.

Sets torch to single-threaded mode for CPU inference during tests.
With 16+ CPU threads, PyTorch's inter-op parallelism adds more overhead
than the small networks save, making each forward pass ~60x slower
than single-threaded. Setting num_threads=1 keeps tests in the
seconds range rather than minutes.
"""
import torch

torch.set_num_threads(1)
