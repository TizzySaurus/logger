import logging
import logging.config
import os
import pathlib
import sys

import discord
import yaml
from dotenv import load_dotenv
from discord.ext import commands

from utils.batchers import MessageBatcher
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

    async def on_error(self, event_method: str, /, *args, **kwargs) -> None:
        e_type, e, _ = sys.exc_info()
        self.logger.exception(f"Received an unhandled {e_type.__name__} error: {e}.")
        return await super().on_error(event_method, *args, **kwargs)

    async def setup_hook(self):
        await self.initialise_postgres()

        self.message_batcher = MessageBatcher(self.db)

        await self.load_extensions()

    async def load_extensions(self):
        cogs_dir = pathlib.Path("cogs")
        extension_files: list[str] = []

        for python_file in [file for file in cogs_dir.rglob("*.py")]:
            if python_file.name == "__init__.py":
                continue

            extension_parts = python_file.relative_to(cogs_dir).parts
            extension_file = ".".join(extension_parts)
            extension_file_name = extension_file[:-3]

            extension = f"cogs.{extension_file_name}"
            extension_files.append(extension)

            try:
                await bot.load_extension(extension)
                bot.logger.debug(f"Successfully loaded extension {extension!r}")
            except Exception as e:
                bot.logger.exception(f"Failed to load extension {extension!r}:\n{e}\n")

        self._extension_files = extension_files

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
