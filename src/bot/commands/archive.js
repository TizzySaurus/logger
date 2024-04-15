const { displayUser } = require('../utils/constants');
const { createHaste } = require('../utils/createHaste')

module.exports = {
  func: async (message, suffix) => {
    if (!process.env.PASTE_SITE_ROOT_URL) return message.channel.createMessage('The bot owner hasn\'t yet configured the paste site, so this command is unavailable.')
    const limit = parseInt(process.env.MESSAGE_ARCHIVE_SIZE || 1000);
    if (!suffix || isNaN(suffix)) return message.channel.createMessage(`That isn't a valid suffix! Please provide any number between 5 and ${limit}.`)
    const num = parseInt(suffix)
    if (num < 5 || num > limit) return message.channel.createMessage(`That number is invalid! Please provide any number between 5 and ${limit}`)

    const messages = await message.channel.getMessages({ limit: num })
    const pasteString = messages.reverse().filter(m => !m.applicationID).map(m => `${displayUser(m.author)} (${m.author.id}) | ${new Date(m.timestamp).toUTCString()}: ${m.content ? m.content : ''} ${m.embeds.length === 0 ? '' : `| {"embeds": [${m.embeds.map(e => JSON.stringify(e))}]}`} | ${m.attachments.length === 0 ? '' : ` =====> Attachment: ${m.attachments[0].filename}:${m.attachments[0].url}`}`).join('\r\n')
    const link = await createHaste(pasteString)
    message.channel.createMessage({
      content: `<@${message.author.id}>, **${messages.length}** message(s) could be archived. Link: ${link || "View the messages.txt file!"}`,
    }, {
      name: "messages.txt",
      file: Buffer.from(pasteString)
    })
  },
  name: 'archive',
  category: 'Utility',
  perm: 'manageMessages',
  quickHelp: `Makes a log online of up to the last ${process.env.MESSAGE_ARCHIVE_SIZE || 100} messages in a channel. Does NOT delete any messages.`,
  examples: `\`${process.env.GLOBAL_BOT_PREFIX}archive 5\` <- lowest amount possible
  \`${process.env.GLOBAL_BOT_PREFIX}archive ${process.env.MESSAGE_ARCHIVE_SIZE || 1000}\` <- maximum count of messages to archive
  \`${process.env.GLOBAL_BOT_PREFIX}archive 25\` <- create a log of the last 25 messages in the channel`
}
