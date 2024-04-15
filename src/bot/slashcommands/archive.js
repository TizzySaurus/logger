const { EMBED_COLORS, displayUser } = require('../utils/constants.js')
const { getEmbedFooter, getAuthorField } = require('../utils/embeds.js')
const { createHaste } = require('../utils/createHaste.js')

module.exports = {
  name: 'archive',
  botPerms: ['readMessageHistory'],
  userPerms: ['readMessageHistory', 'manageMessages'],
  func: async interaction => {
    if (!process.env.PASTE_SITE_ROOT_URL) return interaction.createMessage({
      embeds: [{
        title: 'Unsuccessful',
        description: 'The bot owner hasn\'t yet configured the paste site, so this command is unavailable.',
        thumbnail: {
          url: interaction.member.user.dynamicAvatarURL(null, 64)
        },
        color: EMBED_COLORS.RED,
        footer: getEmbedFooter(global.bot.user),
        author: getAuthorField(interaction.member.user)
      }]
    }).catch(() => { })
    const limit = parseInt(process.env.MESSAGE_ARCHIVE_SIZE || 1000)
    if (!interaction.data.options || !interaction.data.options[0] || interaction.data.options[0].value > limit || interaction.data.options[0].value < 5) {
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
    const fetchedMessages = await global.bot.getChannel(interaction.channel.id).getMessages({ limit: interaction.data.options[0].value })
    const pasteString = fetchedMessages.reverse().filter(m => !m.applicationID).map(m => `${displayUser(m.author)} (${m.author.id}) | ${new Date(m.timestamp)}: ${m.content || ''} | ${m.embeds.length === 0 ? '' : `{"embeds": [${m.embeds.map(e => JSON.stringify(e))}]}`} | ${m.attachments.length === 0 ? '' : ` ${m.attachments.map((c) => `=====> Attachment: ${c.filename}: ${m.url}`).join(" | ")}`}`).join('\r\n')
    await interaction.createMessage({
      embeds: [{ // make sure followup message is created before doing any more work
        title: 'Processing',
        description: `Processing request from ${displayUser(interaction.member)} for an archive of ${interaction.data.options[0].value} messages`,
        thumbnail: {
          url: interaction.member.user.dynamicAvatarURL(null, 64)
        },
        color: EMBED_COLORS.YELLOW_ORANGE,
        footer: getEmbedFooter(global.bot.user),
        author: getAuthorField(interaction.member.user)
      }]
    }).catch(() => null);
    const link = await createHaste(pasteString);
    if (!link) {
      return interaction.editOriginalMessage({
        embeds: [{
          title: 'Error',
          description: 'The archive service returned an error, please try again later!',
          thumbnail: {
            url: interaction.member.user.dynamicAvatarURL(null, 64)
          },
          color: EMBED_COLORS.RED,
          footer: getEmbedFooter(global.bot.user)
        }]
      }).catch(() => { })
    }
    interaction.editOriginalMessage({
      embeds: [{
        title: 'Success',
        description: `Archived ${fetchedMessages.length} messages: ${link}`,
        thumbnail: {
          url: interaction.member.user.dynamicAvatarURL(null, 64)
        },
        color: EMBED_COLORS.GREEN,
        footer: getEmbedFooter(global.bot.user),
        author: getAuthorField(interaction.member.user)
      }]
    }).catch(() => { })
  }
}
