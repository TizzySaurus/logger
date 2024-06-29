module.exports = async guildID => {
  const { getGuild } = require('../../db/interfaces/postgres/read')
  const GuildSettings = require('../bases/GuildSettings') // GuildSettings will NOT resolve if you require it outside of this function(?)
  const doc = await getGuild(guildID)
  global.bot.guildSettingsCache[guildID] = new GuildSettings(doc)
}
