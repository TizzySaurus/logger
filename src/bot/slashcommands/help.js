const { Constants } = require('eris')
const { EMBED_COLORS, ALL_EVENTS, EVENT_HELP } = require('../utils/constants')
const { getEmbedFooter, getAuthorField } = require('../utils/embeds')

module.exports = {
  name: 'help',
  func: async interaction => {
    if (!interaction.data.options) {
      // general help
      interaction.createMessage({
        embeds: [{
          title: 'General Help',
          description: `**How do I configure ${global.bot.user.username}?**\nSee \`/help guide: Usage\` for a short setup guide.`,
          color: EMBED_COLORS.PURPLED_BLUE,
          thumbnail: {
            url: interaction.member.user.dynamicAvatarURL(null, 64)
          },
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
          footer: getEmbedFooter(global.bot.user)
        }],
        flags: Constants.MessageFlags.EPHEMERAL
      }).catch(() => {})
    } else if (interaction.data.options?.find(o => o.name === 'guide')) {
      interaction.createMessage({
        embeds: [{
          title: 'Usage Guide',
          color: EMBED_COLORS.PURPLED_BLUE,
          description: `**__How does ${global.bot.user.username} work for me?__**\nMost actions on Discord (ban, message edit, member join, etc) are available to be set individually or as a preset to any channel you choose and have \`Manage Webhook\` permissions in.\n\n**__To setup logging__**\nUse \`/setup\` in the text channel you want to have the selected events log to. Select \`via_presets\` (set many events at once - joinlog, messages, ...) or \`via_individual_event\` (configure logging individually). Once all the desired presets or events you want to log to the current channel are selected, close the selection box and the bot will start logging your selection of events. If you want more information about an event, select it using \`/help event\`\n\n*Is something not working?* See the requirements below to ensure success in configuring ${global.bot.user.username}. If you need additional help, please contact \`@${process.env.BOT_CREATOR_NAME}\``,
          fields: [{
            inline: true,
            name: '__Permissions: Logging member joins__',
            value: 'For the bot to somewhat accurately log the invite used for a member who joined, it **requires `Manage Channels` (can be channel permission overwrites) and `Manage Server`**. This is because Discord does not send invite information to the bot without it (Manage Channels: receives invites made for channels realtime | Manage Server: to fetch server invites)\n\nYou can find an invite with these permissions by using `/invite`.'
          }, {
            inline: true,
            name: '__Time: Message logging__',
            value: `${global.bot.user.username} cannot log messages upon deletion that it didn't see created first. Additionally, messages are kept for ${process.env.MESSAGE_HISTORY_DAYS} days, so messages older than that will not be logged upon deletion.`
          }],
          footer: getEmbedFooter(global.bot.user),
          author: getAuthorField(interaction.member.user),
          thumbnail: {
            url: interaction.member.user.dynamicAvatarURL(null, 64)
          }
        }],
        flags: Constants.MessageFlags.EPHEMERAL
      }).catch(() => {})
    } else if (interaction.data.options?.find(o => o.name === 'event')) {
      const eventName = interaction.data.options?.find(o => o.name === 'event').value
      if (!ALL_EVENTS.includes(eventName)) {
        return
      }
      interaction.createMessage({
        embeds: [{
          title: `Help for ${eventName} event`,
          color: EMBED_COLORS.PURPLED_BLUE,
          footer: getEmbedFooter(global.bot.user),
          author: getAuthorField(interaction.member.user),
          description: `__**Description**__\n${EVENT_HELP[eventName]}\n\n*Not what you're looking for? Join [my support server](${process.env.DISCORD_SUPPORT_SERVER})*.`
        }],
        flags: Constants.MessageFlags.EPHEMERAL
      })
    }
  }
}
