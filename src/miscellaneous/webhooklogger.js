const { post } = require('superagent')

require('dotenv').config()
let globalHookErrors = 0

setInterval(() => {
  globalHookErrors-- // This timeout exists so that if the shard manager starts to spew errors, I don't get IP banned from Discord.
}, 5000)

function send(type = 'Generic', embeds = [], username = null, avatar_url = null) {
  if (globalHookErrors > 5) {
    return
  }
  post(process.env.DISCORD_WEBHOOK_URL)
    .send({
      avatar_url: avatar_url || 'https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-ios7-bell-512.png',
      username: username || `${type} LoggerBot Webhook Notification`,
      embeds,
    })
    .end(err => {
      if (err) globalHookErrors = globalHookErrors + 1
    })
}

function fatal(message) {
  send('Fatal Error', [
    {
      title: 'Fatal',
      description: message,
      color: 16777215
    }
  ])
}

function error(message) {
  send('Error', [
    {
      title: 'Error',
      description: message,
      color: 16711680
    }
  ])
}

function warn(message) {
  send('Warning', [
    {
      title: 'Warning',
      description: message,
      color: 15466375
    }
  ])
}

function generic(message) {
  send('Generic', [
    {
      title: 'Generic',
      description: message,
      color: 6052351
    }
  ])
}

function custom(message) {
  send('Custom', [
    {
      title: message.title || 'Custom Notification',
      color: message.color || 6052351,
      description: message.description || 'No message description provided.'
    }
  ], message.title, message.avatar_url)
}

exports.error = error
exports.warn = warn
exports.generic = generic
exports.fatal = fatal
exports.custom = custom

if (!process.env.DISCORD_WEBHOOK_URL) {
  global.logger.warn('Discord webhook url not specified, disabling webhook notifier.')
  exports.error = () => { }
  exports.warn = () => { }
  exports.generic = () => { }
  exports.fatal = () => { }
}
