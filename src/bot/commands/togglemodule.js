const { displayUser, ALL_EVENTS: eventList } = require('../utils/constants')
const { disableEvent } = require('../../db/interfaces/postgres/update')

module.exports = {
  func: async (message, suffix) => {
    const split = suffix.split(' ')
    if (!eventList.includes(split[0])) {
      return message.channel.createMessage({
        embeds: [{
          description: `The provided argument is invalid. Valid events: ${eventList.join(', ')}`,
          color: 16711680,
          timestamp: new Date(),
          footer: {
            icon_url: global.bot.user.avatarURL,
            text: displayUser(global.bot.user)
          },
          author: {
            name: displayUser(message.author),
            icon_url: message.author.avatarURL
          }
        }]
      })
    }
    const disabled = await disableEvent(message.channel.guild.id, split[0])
    const respStr = `${!disabled ? 'Enabled' : 'Disabled'} ${split[0]}.`
    message.channel.createMessage({
      embeds: [{
        description: respStr,
        color: 3553599,
        timestamp: new Date(),
        footer: {
          icon_url: global.bot.user.avatarURL,
          text: displayUser(global.bot.user)
        },
        author: {
          name: displayUser(message.author),
          icon_url: message.author.avatarURL
        }
      }]
    })
  },
  name: 'togglemodule',
  quickHelp: `[DEPRECATED]\nIgnore any event provided after this command. You should have no need for this command when you can stop an event from logging by using ${process.env.GLOBAL_BOT_PREFIX}stoplogging.`,
  examples: 'Unneccesary, this command is deprecated.',
  type: 'custom',
  perm: 'manageChannels',
  category: 'Logging'
}
