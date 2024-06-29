const send = require('../modules/webhooksender')
const { displayUser } = require('../utils/constants')

module.exports = {
  name: 'voiceChannelJoin',
  type: 'on',
  handle: async (member, channel) => {
    if (global.bot.guildSettingsCache[channel.guild.id].isChannelIgnored(channel.id)) return
    await send({
      guildID: channel.guild.id,
      eventName: 'voiceChannelJoin',
      embeds: [{
        author: {
          name: `${displayUser(member)} ${member.nick ? `(${member.nick})` : ''}`,
          icon_url: member.avatarURL
        },
        description: `**${displayUser(member)}** joined ${channel.type !== 13 ? 'voice' : 'stage'} channel: ${channel.name}.`,
        fields: [{
          name: 'Channel',
          value: `<#${channel.id}> (${channel.name})`
        }, {
          name: 'ID',
          value: `\`\`\`ini\nUser = ${member.id}\nChannel = ${channel.id}\`\`\``
        }],
        color: 3553599
      }]
    })
  }
}
