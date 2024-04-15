const pool = require('../../clients/postgres')
const { createGuild } = require('./create')
const aes = require('../../aes')

async function getAllGuilds() {
  const doc = await pool.query('SELECT * FROM guilds;')
  return doc.rows
}

async function getGuild(guildID) {
  const doc = await pool.query('SELECT * FROM guilds WHERE id=$1;', [guildID])
  if (doc.rows.length === 0) {
    if (global.bot.guilds.get(guildID)) {
      await createGuild(global.bot.guilds.get(guildID))
      return await getGuild(guildID)
    }
  }
  return doc.rows[0]
}

async function getMessageById(messageID) {
  let message = await pool.query('SELECT * FROM messages WHERE id=$1', [messageID])
  if (message.rows.length === 0) return null
  message = await decryptMessageDoc(message.rows[0])
  return message
}

async function decryptMessageDoc(message) {
  message.content = aes.decrypt(message.content)
  if (message.attachment_b64) message.attachment_b64 = message.attachment_b64.split("|").map(encrypted_img_url => aes.decrypt(encrypted_img_url)).join("|")
  return message
}

async function getMessagesByIds(messageIds) {
  const message = await pool.query('SELECT * FROM messages WHERE id = ANY ($1)', [messageIds])
  if (message.rows.length === 0) return null
  const decryptedMessages = []
  message.rows.forEach(async row => {
    decryptedMessages.push(await decryptMessageDoc(row))
  })
  return decryptedMessages
}

exports.getMessageById = getMessageById
exports.getAllGuilds = getAllGuilds
exports.getGuild = getGuild
exports.getMessagesByIds = getMessagesByIds
