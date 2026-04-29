"""Training-time utilities: CSV metrics, checkpoint save/load."""
import csv
from dataclasses import asdict
from typing import Any, Dict

import torch


_HEADER = [
    "iter", "phase", "total_loss", "policy_loss", "value_loss",
    "entropy", "eval_winrate", "best_winrate", "plateau_count",
]


class MetricsLogger:
    """Append-only CSV logger for per-iter and per-eval metrics.

    Iter rows fill loss columns; eval columns are blank.
    Eval rows fill eval columns; loss columns are blank.
    Header is written on open.
    """

    def __init__(self, path: str):
        self._file = open(path, "w", newline="")
        self._writer = csv.writer(self._file)
        self._writer.writerow(_HEADER)
        self._file.flush()

    def log_iter(
        self, iter: int, phase: str,
        total_loss: float, policy_loss: float, value_loss: float, entropy: float,
    ) -> None:
        self._writer.writerow([
            iter, phase, total_loss, policy_loss, value_loss, entropy,
            "", "", "",
        ])
        self._file.flush()

    def log_eval(
        self, iter: int, phase: str,
        eval_winrate: float, best_winrate: float, plateau_count: int,
    ) -> None:
        self._writer.writerow([
            iter, phase, "", "", "", "",
            eval_winrate, best_winrate, plateau_count,
        ])
        self._file.flush()

    def close(self) -> None:
        if not self._file.closed:
            self._file.close()


def save_checkpoint(
    path: str,
    network: torch.nn.Module,
    optimizer: torch.optim.Optimizer,
    iter_num: int,
    config,  # TrainConfig
    best_winrate: float,
    phase: str,
) -> None:
    """Serialize training state to disk."""
    torch.save({
        "iter": iter_num,
        "network": network.state_dict(),
        "optimizer": optimizer.state_dict(),
        "config": asdict(config),
        "best_winrate": best_winrate,
        "phase": phase,
    }, path)


def load_checkpoint(path: str) -> Dict[str, Any]:
    """Load a checkpoint dict written by save_checkpoint."""
    return torch.load(path, map_location="cpu")
