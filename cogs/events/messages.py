from discord import Message
from discord.ext import commands

from bot import MyBot
from utils.aes import encrypt
from utils.batchers import BatchedMessage


class MessageEventsHandler(commands.Cog):
    def __init__(self, bot: MyBot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_message(self, message: Message):
        if message.is_system() or message.author.bot or not message.guild:
            # Ignore messages that are system, from bots, or in DMs
            return
        batched_message = BatchedMessage.from_discord_message(message)
        await self.bot.message_batcher.add(batched_message)

    @commands.Cog.listener()
    async def on_message_edit(self, before: Message, after: Message):
        if before.is_system() or before.author.bot or not before.guild:
            return

        if before.content == after.content:
            # Not the content that was changed, so ignore
            return

        new_encrypted_content = encrypt(after.content or "None").decode()

        if (indx := self.bot.message_batcher.find(after)) != -1:
            # Update message before it's inserted into the database
            self.bot.message_batcher.batch[indx].encrypted_content = new_encrypted_content
            self.bot.logger.debug(f"Updated message {after.id} within batch to new content.")
        else:
            # Update message within the database
            await self.bot.db.execute_sql("UPDATE messages SET content=$1 WHERE id=$2", new_encrypted_content, after.id)
            self.bot.logger.debug(f"Updated message {after.id} within database to new content.")


async def setup(bot: MyBot):
    await bot.add_cog(MessageEventsHandler(bot))
