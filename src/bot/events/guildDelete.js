const { deleteGuild } = require('../../db/interfaces/postgres/delete')
const statAggregator = require('../modules/statAggregator')

module.exports = {
  name: 'guildDelete',
  type: 'on',
  handle: async guild => {
    await deleteGuild(guild.id)
    statAggregator.incrementEvent('guildDelete')
  }
}
