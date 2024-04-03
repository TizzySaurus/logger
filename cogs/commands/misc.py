import time

from discord.ext import commands

from bot import MyBot


class MiscellaneousCommands(commands.Cog):
    def __init__(self, bot: MyBot):
        self.bot = bot

    @commands.command()
    async def ping(self, ctx: commands.Context):
        start = time.perf_counter()
        msg = await ctx.send("Determining RTT ping...")
        end = time.perf_counter()

        # Round down rtt in ms
        rtt_ms = int((end - start) * 1000)

        await msg.edit(content=f"RTT: {rtt_ms}ms")


async def setup(bot: MyBot):
    await bot.add_cog(MiscellaneousCommands(bot))
