const { getMessagesByIds } = require('../../db/interfaces/postgres/read')
const send = require('../modules/webhooksender')
const { createHaste } = require('../utils/createHaste')

module.exports = {
  name: 'messageDeleteBulk',
  type: 'on',
  handle: async messages => {
    if (!messages.length) return // TODO: TEST!
    if (!messages[0].guildId) return;
    const dbMessages = await getMessagesByIds(messages.map(m => m.id))
    await paste(dbMessages, messages[0].guildId)
  }
}

async function paste(messages, guildID) {
  if (!messages) return
  const pasteString = messages.reverse().map(m => {
    let globalUser = global.bot.users.get(m.author_id)
    if (!globalUser) {
      globalUser = {
        username: 'Unknown',
        discriminator: '0',
        avatarURL: '<no avatar>'
      }
    }
    return `${globalUser.username}${globalUser.discriminator === '0' ? '' : `#${globalUser.discriminator}`} (${m.author_id}) | (${globalUser.avatarURL}) | ${new Date(m.ts).toUTCString()}: ${m.content}`
  }).join('\r\n')
  if (!pasteString) {
    return
  }
  const messageDeleteBulkEvent = {
    guildID: guildID,
    eventName: 'messageDeleteBulk',
    embeds: [{
      description: `**${messages.length}** message(s) were deleted and known in cache.`,
      fields: [],
      color: 15550861
    }],
    file: [
      // Send a messages.txt file to the channel.
      { name: `messages.txt`, file: Buffer.from(pasteString) }
    ]
  }
  const link = await createHaste(pasteString)
  if (link) {
    messageDeleteBulkEvent.embeds[0].fields.push({
      name: 'Link',
      value: link
    })
  }
  send(messageDeleteBulkEvent)
}
