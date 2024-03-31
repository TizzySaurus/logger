import logging
import logging.config
import os

import discord
import yaml
from dotenv import load_dotenv
from discord.ext import commands


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

    async def get_prefix(self, message: discord.Message):
        return "!" if message.author.id == self.owner_id else None
    

if __name__ == "__main__":
    intents = discord.Intents.default()
    intents.members = True
    intents.message_content = True

    bot = MyBot(case_insensitive=True, intents=intents, owner_id=442244135840382978)

    load_dotenv()
    bot.run(os.getenv("BOT_TOKEN"))