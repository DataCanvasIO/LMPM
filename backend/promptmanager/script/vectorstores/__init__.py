
from typing import Any

from promptmanager.script.schema.vectordb import PMVectorDB


def _import_dingo() -> Any:
    from promptmanager.script.vectorstores.dingo import Dingo

    return Dingo


def __getattr__(name: str) -> Any:
    if name == "Dingo":
        return _import_dingo()
    else:
        raise AttributeError(f"Could not find: {name}")


__all__ = [
    "Dingo",
    "PMVectorDB"
]
