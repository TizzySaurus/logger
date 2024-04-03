from contextlib import suppress

from discord import HTTPException
from discord.ext import commands

from bot import MyBot


class ErrorEventsHandler(commands.Cog):
    def __init__(self, bot: MyBot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_command_error(self, ctx: commands.Context, error: commands.CommandError):
        # Prevent commands with local handlers being handled here
        if hasattr(ctx.command, "on_error"):
            return

        # Get the original error (for when one error raises another)
        if hasattr(error, "original"):
            error = error.original

        # Prevent ignored error types being handled here
        ignored = (commands.CommandNotFound,)
        if isinstance(error, ignored):
            return

        if isinstance(error, commands.DisabledCommand):
            self.bot.logger.warning(f"filtered commands.DisabledCommand: {error}")
            await ctx.send(f"{ctx.author.mention} {ctx.command} has been disabled.")

        elif isinstance(error, commands.NoPrivateMessage):
            with suppress(HTTPException):
                self.bot.logger.warning(f"filtered commands.NoPrivateMessage: {error}")
                await ctx.author.send(f"{ctx.author.mention} {ctx.command} can't be used in DMs.")

        elif isinstance(error, commands.MissingRequiredArgument):
            self.bot.logger.warning(f"filtered commands.MissingRequiredArgument: {error}")
            if ":" in str(error.param):
                # We know the expected type of the param
                param, _type = str(error.param).split(":")
                await ctx.send(
                    f"{ctx.author.mention} `{ctx.prefix}{ctx.command}` is missing a "
                    f"required argument: `{param}` of type `{_type.split('.')[-1]}`"
                )
            else:
                await ctx.send(f"{ctx.author.mention} {ctx.command} is missing a required argument: `{error.param}`")

        elif isinstance(error, commands.BadArgument):
            self.bot.logger.warning(f"filtered commands.BadArgument: {error}")
            await ctx.send(f"{ctx.author.mention} Failed to convert an argument: {error}.")

        elif isinstance(error, commands.MissingPermissions):
            self.bot.logger.warning(f"filtered commands.MissingPermissions: {error}")
            await ctx.send(
                f"{ctx.author.mention} you're missing the following "
                f"required permissions: {", ".join(error.missing_permissions)}"
            )

        else:
            await ctx.send(f"{ctx.author.mention} An unknown error occured. Please contact `@TizzySaurus`")
            self.bot.logger.exception(f"{error} - {type(error).__name__}")


async def setup(bot: MyBot):
    await bot.add_cog(ErrorEventsHandler(bot))
