const { EMBED_COLORS, displayUser } = require('../utils/constants.js')
const { getEmbedFooter, getAuthorField } = require('../utils/embeds.js')
const { createHaste } = require('../utils/createHaste.js')

module.exports = {
  name: 'archive',
  botPerms: ['readMessageHistory'],
  userPerms: ['readMessageHistory', 'manageMessages'],
  /**
   * @param {import("eris").CommandInteraction} interaction 
   */
  func: async interaction => {
    const limit = parseInt(process.env.MESSAGE_ARCHIVE_SIZE || 1000)
    const num = interaction.data.options?.[0]?.value || 0;
    if (!num || num > limit || num < 5) {
      interaction.createMessage({
        embeds: [{
          title: 'Unsuccessful',
          description: `Amount must be 5 <= amount < ${limit}`,
          thumbnail: {
            url: interaction.member.user.dynamicAvatarURL(null, 64)
          },
          color: EMBED_COLORS.RED,
          footer: getEmbedFooter(global.bot.user),
          author: getAuthorField(interaction.member.user)
        }]
      }).catch(() => { })
    }
    const fetchedMessages = await global.bot.getChannel(interaction.channel.id).getMessages({ limit: num })
    const pasteString = fetchedMessages.reverse().filter(m => !m.applicationID).map(m => `${displayUser(m.author)} (${m.author.id}) | ${new Date(m.timestamp)}: ${m.content || ''} | ${m.embeds.length === 0 ? '' : `{"embeds": [${m.embeds.map(e => JSON.stringify(e))}]}`} | ${m.attachments.length === 0 ? '' : ` ${m.attachments.map((c) => `=====> Attachment: ${c.filename}: ${m.url}`).join(" | ")}`}`).join('\r\n')
    await interaction.createMessage({
      embeds: [{ // make sure followup message is created before doing any more work
        title: 'Processing',
        description: `Processing request from ${displayUser(interaction.member)} for an archive of ${num} messages`,
        thumbnail: {
          url: interaction.member.user.dynamicAvatarURL(null, 64)
        },
        color: EMBED_COLORS.YELLOW_ORANGE,
        footer: getEmbedFooter(global.bot.user),
        author: getAuthorField(interaction.member.user)
      }]
    }).catch(() => null);
    const link = await createHaste(pasteString);
    interaction.editOriginalMessage({
      embeds: [{
        title: 'Success',
        description: `Archived ${fetchedMessages.length} messages: ${link || "View the messages.txt file!"}`,
        thumbnail: {
          url: interaction.member.user.dynamicAvatarURL(null, 64)
        },
        color: EMBED_COLORS.GREEN,
        footer: getEmbedFooter(global.bot.user),
        author: getAuthorField(interaction.member.user)
      }],
    }, {
      name: "messages.txt",
      file: Buffer.from(pasteString)
    }).catch(() => { })
  }
}
