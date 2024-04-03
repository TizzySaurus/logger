from discord import Message
from discord.ext import commands

from bot import MyBot
from utils.batchers import BatchedMessage


class MessageEventsHandler(commands.Cog):
    def __init__(self, bot: MyBot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_message(self, message: Message):
        print(message)
        if message.is_system() or message.author.bot or not message.guild:
            # Ignore messages that are system, from bots, or in DMs
            return
        batched_message = BatchedMessage.from_discord_message(message)
        await self.bot.message_batcher.add(batched_message)


async def setup(bot: MyBot):
    await bot.add_cog(MessageEventsHandler(bot))
