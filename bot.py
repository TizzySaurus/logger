import logging
import logging.config
import os
import pathlib
from datetime import datetime

import discord
import yaml
from dotenv import load_dotenv
from discord.ext import commands

from utils.batcher import Batcher
from utils.postgres import create_postgres_connection


class MyBot(commands.Bot):
    """Custom class for bot."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs, command_prefix=self.get_prefix)

        # Load Logging Config
        with open("logger_config.yaml") as f:
            config = yaml.safe_load(f.read())

        # Set Logging Config
        logging.config.dictConfig(config)
        self.logger = logging.getLogger(__name__)

        # Set Logging Levels
        logging.getLogger("discord").setLevel(logging.WARNING)
        logging.getLogger("websockets").setLevel(logging.WARNING)

    async def setup_hook(self):
        await self.initialise_postgres()

        self.message_batcher = Batcher[tuple[int, int, bytes, str, datetime]](
            1_000, "MESSAGE_BATCH_SIZE", self.submit_message_batch
        )

        await self.load_extensions()

    async def submit_message_batch(self, messages_components: list[tuple[int, int, bytes, str, datetime]]):
        await self.db.execute_sql("INSERT INTO messages VALUES ($1, $2, $3, $4, $5)", messages_components)

    async def load_extensions(self):
        cogs_dir = pathlib.Path("cogs")
        for python_file in [file for file in cogs_dir.rglob("*.py")]:
            if python_file.name == "__init__.py":
                continue

            extension_parts = python_file.relative_to(cogs_dir).parts
            extension_file = ".".join(extension_parts)
            extension_file_name = extension_file[:-3]

            try:
                await bot.load_extension(f"cogs.{extension_file_name}")
                bot.logger.debug(f"Successfully loaded extension {extension_file_name!r}")
            except Exception as e:
                bot.logger.exception(f"Failed to load extension {extension_file_name!r}:\n{e}\n")

    async def initialise_postgres(self):
        self.db = await create_postgres_connection(self.logger)

    async def get_prefix(self, message: discord.Message):
        return "!" if message.author.id == self.owner_id else None


if __name__ == "__main__":
    intents = discord.Intents.default()
    intents.members = True
    intents.message_content = True

    load_dotenv()

    bot = MyBot(case_insensitive=True, intents=intents, owner_id=442244135840382978)
    bot.run(os.getenv("BOT_TOKEN"))
