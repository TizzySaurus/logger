import logging
import logging.config
import os
import pathlib

import discord
import yaml
from dotenv import load_dotenv
from discord.ext import commands

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
        await self.load_extensions()

    async def load_extensions(self):
        for extension in [file for file in pathlib.Path('cogs').glob('*.py')]:
            if extension.name == "__init__.py":
                continue

            try:
                await bot.load_extension(f"cogs.{extension.stem}")
                bot.logger.debug(f"Successfully loaded extension {extension.name!r}")
            except Exception as e:
                bot.logger.exception(f"Failed to load extension {extension.name!r}:\n{e}\n")

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