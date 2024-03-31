from discord.ext import commands

from bot import MyBot


class Startup(commands.Cog):
    def __init__(self, bot: MyBot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        print("Bot Online!")


async def setup(bot: MyBot):
    await bot.add_cog(Startup(bot))
