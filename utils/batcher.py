import os
from collections.abc import Awaitable, Callable
from functools import lru_cache


class Batcher[T]:
    def __init__(self, max_size_default: int, max_size_env_var: str, submit_fn: Callable[[list[T]], Awaitable[None]]):
        self.batch: list[T] = []
        self.max_size_default = max_size_default
        self.max_size_env_var = max_size_env_var
        self.submit_fn = submit_fn

    # Recalculates value every `maxsize` calls
    @lru_cache(maxsize=100)
    def _get_max_batch_size(self):
        value = int(os.getenv(self.max_size_env_var)) or self.max_size_default
        return value

    @property
    def max_batch_size(self):
        return self._get_max_batch_size()

    @property
    def current_batch_size(self):
        return len(self.batch)

    async def add(self, item: T):
        self.batch.append(item)

        if len(self.batch) >= (max_size := self.max_batch_size):
            items_to_submit = self.batch[:max_size]
            self.batch = self.batch[max_size:]
            await self.submit_fn(items_to_submit)
