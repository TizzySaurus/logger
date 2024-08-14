const send = require('../modules/webhooksender')
const updateMessageByID = require('../../db/interfaces/postgres/update').updateMessageByID
const getMessageFromDB = require('../../db/interfaces/postgres/read').getMessageById
const getMessageFromBatch = require('../../db/messageBatcher').getMessage
const { displayUsername } = require('../utils/constants')
const escape = require('markdown-escape')

// markdown-escape is a single exported function, I probably don't need it as a node module lol

module.exports = {
  name: 'messageUpdate',
  type: 'on',
  handle: async (newMessage) => {
    if (!newMessage.channel.guild || !newMessage.author) return
    if (newMessage.author.id === global.bot.user.id) return
    const member = newMessage.channel.guild.members.get(newMessage.author.id) // this member "should" be in cache at all times
    oldMessage = getMessageFromBatch(newMessage.id)
    if (!oldMessage) {
      oldMessage = await getMessageFromDB(newMessage.id)
    }
    if (!oldMessage) return
    if (newMessage.author.bot && !global.bot.global.guildSettingsCache[newMessage.channel.guild.id].isLogBots()) return
    # NB: Messages are stored with markdown escaped, so when comparing content we need to escape the new content
    if ((escape(newMessage.content) === oldMessage.content) && (newMessage.attachments.length === oldMessage.attachment_b64.split("|").filter(Boolean).length)) return // content/attachments didn't change so don't process
    await processMessage(newMessage, oldMessage)

    async function processMessage (newMessage, oldMessage) {
      const messageAuthorUsername = displayUsername(newMessage.author)

      const messageUpdateEvent = {
        guildID: newMessage.channel.guild.id,
        eventName: 'messageUpdate',
        embeds: [{
          author: {
            name: `${messageAuthorUsername} ${member && member.nick ? `(${member.nick})` : ''}`,
            icon_url: newMessage.author.avatarURL
          },
          description: `**${messageAuthorUsername}** ${member && member.nick ? `(${member.nick})` : ''} updated their message in: ${newMessage.channel.name}.`,
          fields: [
            {
              name: `${newMessage.channel.type === 10 || newMessage.channel.type === 11 || newMessage.channel.type === 12 ? 'Thread' : 'Channel'}`,
              value: `<#${newMessage.channel.id}> (${newMessage.channel.name})\n[Go To Message](https://discord.com/channels/${newMessage.channel.guild.id}/${newMessage.channel.id}/${newMessage.id})`
            },
          ],
          color: 15084269
        }]
      }
      let secondMessageUpdatePayload
      if (newMessage.content.length + oldMessage.content.length > 4000) {
        // handles large message nitro editing and helps make huge message edits look nicer.
        messageUpdateEvent.embeds[0].fields.splice(1) // nuke all fields but essential message info
        secondMessageUpdatePayload = JSON.parse(JSON.stringify(messageUpdateEvent)) // deep copy initial payload
        messageUpdateEvent.embeds[0].description += `\n\n**__Now__**:\n${escape(newMessage.content.replace(/~/g, '\\~'), ['angle brackets']).replace(/\"/g, '"').replace(/`/g, '') || "None"}`
        messageUpdateEvent.embeds[0].fields = []
        delete secondMessageUpdatePayload.embeds[0].author
        secondMessageUpdatePayload.embeds[0].description = `**__Previously__**:\n${oldMessage.content}`
        secondMessageUpdatePayload.embeds[0].fields.push({
          name: 'ID',
          value: `\`\`\`ini\nUser = ${newMessage.author.id}\nMessage = ${newMessage.id}\`\`\``
        })
        messageUpdateEvent.noFooter = true
      } else {
        let nowChunks, beforeChunks
        const escapedNewContents = escape(newMessage.content.replace(/~/g, '\\~'), ['angle brackets']).replace(/\"/g, '"').replace(/`/g, '') || "None"
        if (escapedNewContents.length > 1000) {
          nowChunks = chunkify(escapedNewContents)
        } else {
          nowChunks = [escapedNewContents]
        }

        if (oldMessage.content.length > 1000) { // already escaped in db
          beforeChunks = chunkify(oldMessage.content.replace(/\"/g, '"').replace(/`/g, ''))
        } else {
          beforeChunks = [oldMessage.content]
        }
        if (nowChunks.length === 0) {
          nowChunks.push('<no message content>')
        }
        if (beforeChunks.length === 0) {
          beforeChunks.push('<no message content>')
        }
        nowChunks.forEach((chunk, i) => {
          messageUpdateEvent.embeds[0].fields.push({
            name: i === 0 ? 'Now' : 'Now Continued',
            value: chunk
          })
        })
        beforeChunks.forEach((chunk, i) => {
          messageUpdateEvent.embeds[0].fields.push({
            name: i === 0 ? 'Previous' : 'Previous Continued',
            value: chunk // previous is already escaped, don't escape again
          })
        })
        messageUpdateEvent.embeds[0].fields.push({
          name: 'ID',
          value: `\`\`\`ini\nUser = ${newMessage.author.id}\nMessage = ${newMessage.id}\`\`\``
        })
      }

      let newUrls = [];
      if (oldMessage.attachment_b64) {
        const oldImageUrls = oldMessage.attachment_b64.split("|").map(base64url => Buffer.from(base64url, "base64url").toString("utf-8")).filter(Boolean)
        newAttachmentImages = newMessage.attachments.filter(attachment => attachment.content_type.startsWith("image"))
        if (oldImageUrls.length > newAttachmentImages.length) {
          // Removed at least one image from the message
          newUrls = newAttachmentImages.map(img => img.url)
          const removedImageUrls = oldImageUrls.filter(url => !newUrls.includes(url))
          removedImageUrls.forEach( (url, indx) => messageUpdateEvent.embeds[indx] = {
            ...messageUpdateEvent.embeds[indx],
            image: { url },
            url: "https://example.com"
          })
          messageUpdateEvent.embeds[0].fields.push({
            name: `Deleted Image${(removedImageUrls.length > 1) ? 's' : ''}`,
            value: "See below"
          })
        }
      }

      let changedAttrs = {}
      if (newMessage.content !== oldMessage.content)
        changedAttrs.content = newMessage.content
      if (newUrls.length)
        changedAttrs.imageUrls = newUrls
      await updateMessageByID(newMessage.id, changedAttrs)
      await send(messageUpdateEvent)
      if (secondMessageUpdatePayload) {
        await send(secondMessageUpdatePayload)
      }
    }
  }
}

function chunkify (toChunk) {
  const lenChunks = Math.ceil(toChunk.length / 1000)
  const chunksToReturn = []
  for (let i = 0; i < lenChunks; i++) {
    const chunkedStr = toChunk.substring((1000 * i), i === 0 ? 1000 : 1000 * (i + 1))
    chunksToReturn.push(chunkedStr)
  }
  return chunksToReturn
}
