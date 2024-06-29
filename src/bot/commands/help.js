const { displayUser } = require("../utils/constants")

module.exports = {
  func: async (message, suffix) => {
    let DMC
    try {
      DMC = await message.author.getDMChannel()
    } catch (e) {
      message.channel.createMessage(`<@${message.author.id}>, you're not capable of receiving a DM from me.`).catch(() => {})
      return
    }

    if (suffix) {
      if (!global.bot.commands[suffix] || global.bot.commands[suffix]?.hidden) {
        return message.channel.createMessage(`<@${message.author.id}>, that isn't a valid command. Use \`${process.env.GLOBAL_BOT_PREFIX}help\` to see all commands.`)
      }
      await message.channel.createMessage({
        embeds: [{
          title: `Help for ${suffix}`,
          description: global.bot.commands[suffix].quickHelp,
          fields: [{
            name: 'Examples',
            value: global.bot.commands[suffix].examples
          }],
          color: 0xFFFFFF
        }]
      })
    } else {
      const embed = {
        description: `Below, you can see my commands listed by name and description. To learn more about a command or view examples, use ${process.env.GLOBAL_BOT_PREFIX}help commandname.`,
        color: 3553599,
        timestamp: new Date(),
        footer: {
          icon_url: global.bot.user.avatarURL,
          text: displayUser(global.bot.user)
        },
        thumbnail: {
          url: global.bot.user.avatarURL
        },
        author: {
          name: displayUser(message.author),
          icon_url: message.author.avatarURL
        },
        fields: []
      }
      Object.values(global.bot.commands).forEach(command => {
        if (!command.hidden) {
          embed.fields.push({
            name: command.name,
            value: `${command.quickHelp}\n\nExample(s):\n${command.examples}`
          })
        }
      })
      try {
        await DMC.createMessage({
          embeds: [embed]
        })
        await DMC.createMessage({
          embeds: [{
            description: 'Continued help information...',
            fields: [{
              inline: true,
              name: 'Open Source',
              value: 'See https://github.com/tizzysaurus/logger for current code.'
            }, {
              inline: true,
              name: 'Dashboard',
              value: 'There are currently no plans for a dashboard, as I don\'t have a website to host it on.'
            }, {
              inline: false,
              name: 'Privacy Policy',
              value: `Please contact \`@${process.env.BOT_CREATOR_NAME}\` for privacy information`
            }, {
              inline: true,
              name: 'Support',
              value: `See \`/help event: eventname\` for any event you want further clarification on. If something is going terribly wrong, go ahead and join [my support server](${process.env.DISCORD_SUPPORT_SERVER})`
            }, {
              inline: false,
              name: 'Donations',
              value: `If you like me and want to support my owner, you can contact \`@${process.env.BOT_CREATOR_NAME}\`.`
            }],
          }]
        })
        await message.addReaction('📜')
      } catch (_) {
        message.addReaction('❌').catch(() => {})
        message.channel.createMessage(`<@${message.author.id}>, I can't send you a help DM! Open your DMs to fix this or use \`${process.env.GLOBAL_BOT_PREFIX}help commandname\``).catch(() => {})
      }
    }
  },
  name: 'help',
  quickHelp: 'DM you with a help message!',
  examples: `\`${process.env.GLOBAL_BOT_PREFIX}help\` <- DM a help message with every command
  \`${process.env.GLOBAL_BOT_PREFIX}help setchannel\` <- get further info (examples) on any command`,
  type: 'any',
  category: 'General'
}
