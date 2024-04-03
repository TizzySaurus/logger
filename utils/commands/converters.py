from discord.ext import commands

from bot import MyBot


class CogConverter(commands.Converter):
    async def convert(self, ctx: commands.Context[MyBot], argument: str):
        # TODO: Add support for specifying cog names instead of extension names?

        extension_name = argument if argument.startswith("cogs.") else f"cogs.{argument}"

        if extension_name in ctx.bot._extension_files:
            return extension_name

        raise commands.BadArgument(f"{argument!r} is not a valid extension name")
