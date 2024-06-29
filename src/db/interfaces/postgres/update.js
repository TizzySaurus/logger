const pool = require('../../clients/postgres')
const { getGuild } = require('./read')
const cacheGuild = require('../../../bot/utils/cacheGuild')
const { eventLogs } = require("../../../bot/utils/constants")
const { getMessage } = require('../../messageBatcher')
const { updateMessage } = require('../../messageBatcher')
const aes = require('../../aes')

async function clearEventLog (guildID) {
  await cacheGuild(guildID)
  return await pool.query('UPDATE guilds SET event_logs=$1 WHERE id=$2', [eventLogs, guildID])
}

async function clearEventByID (guildID, channelID) {
  const doc = await getGuild(guildID)
  const eventLogs = doc.event_logs
  Object.keys(eventLogs).forEach(event => {
    if (eventLogs[event] === channelID) {
      eventLogs[event] = ''
    }
  })
  await pool.query('UPDATE guilds SET event_logs=$1 WHERE id=$2', [eventLogs, guildID])
  await cacheGuild(guildID)
}

async function setAllEventsOneId (guildID, channelID) {
  const doc = await getGuild(guildID)
  const eventLogs = doc.event_logs
  Object.keys(eventLogs).forEach(event => {
    eventLogs[event] = channelID
  })
  await pool.query('UPDATE guilds SET event_logs=$1 WHERE id=$2', [eventLogs, guildID])
  await cacheGuild(guildID)
}

async function setEventsLogId (guildID, channelID, events) {
  const doc = await getGuild(guildID)
  events.forEach(event => {
    doc.event_logs[event] = channelID
  })
  await pool.query('UPDATE guilds SET event_logs=$1 WHERE id=$2', [doc.event_logs, guildID])
  await cacheGuild(guildID)
}

async function disableEvent (guildID, event) {
  const doc = await getGuild(guildID)
  let disabled = true
  if (doc.disabled_events.includes(event)) {
    doc.disabled_events.splice(doc.disabled_events.indexOf(event), 1)
    disabled = false
  } else {
    doc.disabled_events.push(event)
  }
  global.bot.guildSettingsCache[guildID].disabledEvents = doc.disabled_events
  await pool.query('UPDATE guilds SET disabled_events=$1 WHERE id=$2', [doc.disabled_events, guildID])
  await cacheGuild(guildID)
  return disabled
}

async function ignoreChannel (guildID, channelID) {
  const doc = await getGuild(guildID)
  let disabled = true
  if (doc.ignored_channels.includes(channelID)) {
    const index = doc.ignored_channels.indexOf(channelID)
    doc.ignored_channels.splice(index, 1)
    disabled = false
  } else {
    doc.ignored_channels.push(channelID)
  }
  global.bot.guildSettingsCache[guildID].ignoredChannels = doc.ignored_channels
  await pool.query('UPDATE guilds SET ignored_channels=$1 WHERE id=$2', [doc.ignored_channels, guildID])
  return disabled
}

async function clearIgnoredChannels (guildID) {
  global.bot.guildSettingsCache[guildID].ignoredChannels = []
  await pool.query('UPDATE guilds SET ignored_channels=$1 WHERE id=$2', [[], guildID])
}

async function toggleLogBots (guildID) {
  const doc = await getGuild(guildID)
  await pool.query('UPDATE guilds SET log_bots=$1 WHERE id=$2', [!doc.log_bots, guildID])
  global.bot.guildSettingsCache[guildID].logBots = !doc.log_bots
  return !doc.log_bots
}

async function updateMessageByID (id, changedAttrs) {
  const batchMessage = getMessage(id)
  if (!batchMessage) {
    if ('imageUrls' in changedAttrs) {
      const newAttachmentB64 = changedAttrs.imageUrls.map(url => aes.encrypt(Buffer.from(url).toString("base64url"))).join("|")
      if ('content' in changedAttrs) {
        // Image(s) and content changed
        return await pool.query('UPDATE messages SET content=$1, attachment_b64=$2  WHERE id=$3', [aes.encrypt(changedAttrs.content || 'None'), newAttachmentB64, id])
      }
      // Just image(s) changed
      return await pool.query('UPDATE messages SET attachment_b64=$1 WHERE id=$2', [newAttachmentB64, id])
    } else if ('content' in changedAttrs) {
      // Just content changed
      return await pool.query('UPDATE messages SET content=$1 WHERE id=$2', [aes.encrypt(changedAttrs.content || 'None'), id])
    } else {
      const msg = `updateMessageById called with unsupported changedAttrs: ${JSON.stringify(changedAttrs)}`
      global.logger.warn(msg)
      global.webhook.warn(msg);
    }
  } else {
    updateMessage(id, changedAttrs)
  }
}

exports.toggleLogBots = toggleLogBots
exports.disableEvent = disableEvent
exports.ignoreChannel = ignoreChannel
exports.clearEventLog = clearEventLog
exports.clearEventByID = clearEventByID
exports.setAllEventsOneId = setAllEventsOneId
exports.setEventsLogId = setEventsLogId
exports.clearIgnoredChannels = clearIgnoredChannels
exports.updateMessageByID = updateMessageByID
