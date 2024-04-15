const send = require('../modules/webhooksender')
const { getMessageById } = require('../../db/interfaces/postgres/read')
const { getMessage } = require('../../db/messageBatcher')
const { deleteMessage } = require('../../db/interfaces/postgres/delete')
const cacheGuild = require('../utils/cacheGuild')
const { chunkify, displayUser } = require('../utils/constants')

module.exports = {
  name: 'messageDelete',
  type: 'on',
  handle: async message => {
    if (!message.channel.guild) return
    const guildSettings = global.bot.guildSettingsCache[message.channel.guild.id]
    if (!guildSettings) await cacheGuild(message.channel.guild.id)
    if (global.bot.guildSettingsCache[message.channel.guild.id].isChannelIgnored(message.channel.id)) return
    const cachedMessage = getMessage(message.id) || await getMessageById(message.id);
    if (!cachedMessage) return
    await deleteMessage(message.id)
    let cachedUser = global.bot.users.get(cachedMessage.author_id)
    if (!cachedUser) {
      try {
        cachedUser = await message.channel.guild.getRESTMember(cachedMessage.author_id)
        message.channel.guild.members.add(cachedUser, global.bot)
      } catch (_) {
        // either the member does not exist or the person left and others are deleting their messages
      }
    }
    const member = message.channel.guild.members.get(cachedMessage.author_id)
    const messageDeleteEvent = {
      guildID: message.channel.guild.id,
      eventName: 'messageDelete',
      embeds: [{
        author: {
          name: cachedUser ? `${displayUser(cachedUser)} ${member && member.nick ? `(${member.nick})` : ''}` : `Unknown User <@${cachedMessage.author_id}>`,
          icon_url: cachedUser ? cachedUser.avatarURL : 'https://logger.bot/staticfiles/red-x.png'
        },
        description: `Message deleted in <#${message.channel.id}>`,
        fields: [],
        color: 8530669
      }]
    }
    let messageChunks = []
    if (cachedMessage.content) {
      if (cachedMessage.content.length > 1000) {
        messageChunks = chunkify(cachedMessage.content.replace(/"/g, '"').replace(/`/g, ''))
      } else {
        messageChunks.push(cachedMessage.content)
      }
    } else {
      messageChunks.push('<no message content>')
    }
    messageChunks.forEach((chunk, i) => {
      messageDeleteEvent.embeds[0].fields.push({
        name: i === 0 ? 'Content' : 'Continued',
        value: chunk
      })
    })
    messageDeleteEvent.embeds[0].fields.push({
      name: 'Date',
      value: `<t:${Math.round(cachedMessage.ts / 1000)}:F>`
    }, {
      name: 'ID',
      value: `\`\`\`ini\nUser = ${cachedMessage.author_id}\nMessage = ${cachedMessage.id}\`\`\``
    })

    if (cachedMessage.attachment_b64) {
      let attachment_b64urls = cachedMessage.attachment_b64.split("|")
      attachment_b64urls.forEach(
        (base64url, indx) => messageDeleteEvent.embeds[indx] = {
          ...messageDeleteEvent.embeds[indx],
          image: { url: Buffer.from(base64url, "base64url").toString("utf-8") },
          url: "https://example.com"
        }
      )
    }
    await send(messageDeleteEvent)
  }
}