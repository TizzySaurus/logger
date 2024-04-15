const pool = require('../../clients/postgres')
const aes = require('../../aes')
const cacheGuild = require('../../../bot/utils/cacheGuild')
const batchHandler = require('../../messageBatcher')
const escape = require('markdown-escape')
const { eventLogs } = require("../../../bot/utils/constants")

async function createGuild (guild) {
  try {
    await pool.query('INSERT INTO guilds (id, owner_id, ignored_channels, disabled_events, event_logs, log_bots, custom_settings) VALUES ($1, $2, $3, $4, $5, $6, $7)', [guild.id, guild.ownerID, [], [], eventLogs, false, { }]) // Regenerate the document if a user kicks and reinvites the bot.
    await cacheGuild(guild.id)
  } catch (e) {
    return
  }
}

async function cacheMessage (message) {
  // Encrypt Content
  if (!message.content) {
    message.content = aes.encrypt('None')
  } else {
    message.content = aes.encrypt(escape(message.content.replace(/~/g, '\\~'), ['angle brackets']))
  }
  // Encrypt Images (max 10)
  let images = message.attachments.filter(attachment => attachment.content_type?.startsWith("image"))
  if (images.length === 0)
    message.attachment_b64 = ""
  else if (images.length > 10) {
    // Discord only allows 10 embeds per message, and since we send 1 image per embed we can't have more than 10 images.
    // Rather than just sending the first 10, we check to see if there's any duplicates, and if so, remove them.
    const uniqueImages = Array.from(new Set(images.map(image => image.url))).map(url => images.find(image => image.url === url))
    images = uniqueImages.slice(0, 10);
  }
  // Note that we can use '|' as a separator since base64 encoded strings (the output of aes.encrypt) cannot contain the '|' character.
  message.attachment_b64 = images.map(attachment => aes.encrypt(Buffer.from(attachment.url).toString("base64url"))).join("|")

  batchHandler.addItem([message.id, message.author.id, message.content, message.attachment_b64, new Date().toISOString()])
}

exports.cacheMessage = cacheMessage
exports.createGuild = createGuild
