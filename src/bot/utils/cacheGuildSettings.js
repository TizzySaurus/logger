const { getAllGuilds } = require('../../db/interfaces/postgres/read')
const GuildSettings = require('../bases/GuildSettings')

module.exports = async () => {
  const allDBGuilds = await getAllGuilds()
  for (const guild of allDBGuilds) {
    if (!global.bot.guilds.has(guild.id)) { // If the server isn't handled by this shard, don't add it to the cache. 
      continue;
    }
    global.bot.guildSettingsCache[guild.id] = new GuildSettings(guild);
  }
}
