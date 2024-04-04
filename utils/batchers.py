import os
from dataclasses import dataclass
from datetime import datetime
from functools import lru_cache
from typing import Any

from discord import Message

from .aes import encrypt
from .postgres import PostgresConnection


class Batcher[T]:
    def __init__(self, db: PostgresConnection, *, max_size_default: int, max_size_env_var: str):
        self.batch: list[T] = []
        self.db = db
        self.max_size_default = max_size_default
        self.max_size_env_var = max_size_env_var

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
            await self.submit(items_to_submit)

    def find(self, item_to_find):
        for indx, item in enumerate(self.batch):
            if item == item_to_find:
                return indx
        return -1

    async def submit(self, _):
        raise NotImplementedError(f"Batcher class {self.__class__.__name__!r} is missing the async submit method.")


@dataclass(eq=False)
class BatchedMessage:
    id: int
    author_id: int
    encrypted_content: bytes
    encrypted_content_tag: bytes
    encrypted_content_nonce: bytes
    encrypted_attachments: bytes
    encrypted_attachments_tag: bytes
    encrypted_attachments_nonce: bytes
    created_at: datetime

    @classmethod
    def from_discord_message(cls, message: Message):
        return cls(message.id, message.author.id, *encrypt(message.content or ""), *encrypt(""), message.created_at)

    def to_tuple(self):
        return (
            self.id,
            self.author_id,
            self.encrypted_content,
            self.encrypted_content_tag,
            self.encrypted_content_nonce,
            self.encrypted_attachments,
            self.encrypted_attachments_tag,
            self.encrypted_attachments_nonce,
            self.created_at,
        )

    def __eq__(self, other: Any):
        if isinstance(other, Message):
            return self.id == other.id

        if isinstance(other, int):
            return self.id == other

        return False


class MessageBatcher(Batcher[BatchedMessage]):
    def __init__(self, db: PostgresConnection):
        super().__init__(db, max_size_default=1_000, max_size_env_var="MESSAGE_BATCH_SIZE")

    async def submit(self, messages_to_submit: list[BatchedMessage]):
        await self.db.execute_sql(
            "INSERT INTO messages VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
            (*map(lambda bm: bm.to_tuple(), messages_to_submit),),
        )
