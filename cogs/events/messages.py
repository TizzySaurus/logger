from datetime import datetime

from discord import Message
from discord.ext import commands

from bot import MyBot
from utils.aes import encrypt


class MessageEventsHandler(commands.Cog):
    def __init__(self, bot: MyBot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_message(self, message: Message):
        print(message)
        if message.is_system() or message.author.bot or not message.guild:
            # Ignore messages that are system, from bots, or in DMs
            return

        as_tuple = MessageEventsHandler.message_to_tuple(message)
        await self.bot.message_batcher.add(as_tuple)

    @staticmethod
    def message_to_tuple(message: Message) -> tuple[int, int, bytes, str, datetime]:
        return (message.id, message.author.id, encrypt(message.content or "None").decode(), "", message.created_at)


async def setup(bot: MyBot):
    await bot.add_cog(MessageEventsHandler(bot))
