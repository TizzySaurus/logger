from discord import Embed
from discord.ext import commands

from bot import MyBot
from utils.commands.converters import CogConverter


class OwnerCommands(commands.Cog):
    def __init__(self, bot: MyBot):
        self.bot = bot

    async def cog_check(self, ctx: commands.Context):
        return await self.bot.is_owner(ctx.author)

    @commands.group(invoke_without_command=True)
    async def cogs(self, ctx: commands.Context):
        loaded_cogs = []
        unloaded_cogs = []
        loaded_extensions = self.bot.extensions

        for extension in self.bot._extension_files:
            if extension in loaded_extensions:
                loaded_cogs.append(extension[5:])
                continue
            unloaded_cogs.append(extension[5:])

        embed = Embed(title="Cog List")
        embed.set_footer(text=f"Requested by {ctx.author}")
        if loaded_cogs:
            embed.add_field(name="Loaded", value=", ".join(loaded_cogs), inline=False)

        if unloaded_cogs:
            embed.add_field(name="Unloaded", value=", ".join(unloaded_cogs), inline=False)

        await ctx.send(embed=embed)

    @cogs.command(name="load")
    async def load_cog(self, ctx: commands.Context, cog: CogConverter):
        await self.bot.load_extension(cog)
        await ctx.send(f"{ctx.author.mention} Successfully loaded {cog}.")

    @cogs.command(name="unload")
    async def unload_cog(self, ctx: commands.Context, cog: CogConverter):
        await self.bot.unload_extension(cog)
        await ctx.send(f"{ctx.author.mention} Successfully unloaded {cog}.")

    @cogs.command(name="reload")
    async def reload_cog(self, ctx: commands.Context, cog: CogConverter):
        await self.bot.reload_extension(cog)
        await ctx.send(f"{ctx.author.mention} Successfully reload {cog}.")


async def setup(bot: MyBot):
    await bot.add_cog(OwnerCommands(bot))
