global.logger = require('../miscellaneous/logger');
const format = require('pg-format')
const pool = require('./clients/postgres')
const aes = require('./aes')
const batch = []
// Change these out to use let instead of populating 'global' with something that is only used in this file.
let timesSubmitted = 0
let totalMessagesSubmitted = 0

function getBatchSize() {
  return +process.env.MESSAGE_BATCH_SIZE || 1000
}

async function addItem (messageAsArray) {
  batch.push(messageAsArray)
  const batchSize = getBatchSize()
  if (batch.length >= batchSize) {
    await submitBatch(batchSize)
  }
}

async function submitBatch (batchSize) {
  const toSubmit = batch.splice(0, batchSize)
  const poolClient = await pool.getPostgresClient()
  await poolClient.query(format('INSERT INTO messages (id, author_id, content, attachment_b64, ts) VALUES %L ON CONFLICT DO NOTHING', toSubmit))
  poolClient.release()
  timesSubmitted += 1
  totalMessagesSubmitted += batchSize

  const msg = `Submitted ${toSubmit.length} messages within batch #${timesSubmitted} (${totalMessagesSubmitted} total).`;
  global.logger.info(msg)
  global.webhook.generic(msg)

  return toSubmit.length
}

function getMessage (messageID) {
  const message = batch.find(m => m[0] === messageID)
  if (!message) return
  return {
    id: message[0],
    author_id: message[1],
    content: aes.decrypt(message[2]),
    // Note that we can use '|' as a separator since base64url encoded strings (the output of aes.decrypt) cannot contain the '|' character.
    attachment_b64: message[3] ? message[3].split("|").map(encrypted_img_url => aes.decrypt(encrypted_img_url)).join("|") : '',
    ts: Date.parse(message[4])
  }
}

function getMessageCount() {
  return batch.length;
}

function updateMessage (messageID, changedAttrs) {
  for (let i = 0; i < batch.length; i++) {
    if (batch[i][0] === messageID) {
      if ('content' in changedAttrs)
        batch[i][2] = aes.encrypt(changedAttrs.content || 'None')
      else if ('imageUrls' in changedAttrs)
        batch[i][3] = changedAttrs.imageUrls.map(url => aes.encrypt(Buffer.from(url).toString("base64url"))).join("|")
      else {
        const msg = `updateMessage called with unsupported changedAttrs: ${JSON.stringify(changedAttrs)}`
        global.logger.warn(msg)
        global.webhook.warn(msg);
      }
      break
    }
  }
}

exports.getMessage = getMessage
exports.getMessageCount = getMessageCount
exports.addItem = addItem
exports.updateMessage = updateMessage
exports.submitBatch = submitBatch
