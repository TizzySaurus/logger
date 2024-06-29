const { displayUser } = require("../utils/constants")

module.exports = {
  func: async message => {
    await message.channel.createMessage({
      embeds: [{
        title: 'Action needed:',
        description: `To clear your data (messages), please contact \`@${process.env.BOT_CREATOR_NAME}\`. Remember: all messages stored are encrypted and automatically removed from the database after ${process.env.MESSAGE_HISTORY_DAYS} days.`,
        color: 16711680,
        timestamp: new Date(),
        footer: {
          icon_url: global.bot.user.avatarURL,
          text: displayUser(global.bot.user)
        },
        author: {
          name: displayUser(message.author),
          icon_url: message.author.avatarURL
        },
        fields: []
      }]
    })
  },
  name: 'clearmydata',
  quickHelp: `Provides the information needed to clear your data from the bot. Your stored data (messages) is automatically deleted after ${process.env.MESSAGE_HISTORY_DAYS} days from the database regardless of using this command.`,
  examples: `\`${process.env.GLOBAL_BOT_PREFIX}clearmydata\``,
  type: 'any',
  category: 'Utility'
}
