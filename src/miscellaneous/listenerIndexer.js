const { readdirSync } = require('fs')
const { resolve } = require('path')

module.exports = () => {
  const files = readdirSync(resolve('src', 'bot', 'events'))
  const once = []
  const on = []
  files.forEach(filename => {
    if (require.cache[resolve('src', 'bot', 'events', filename)]) {
      delete require.cache[resolve('src', 'bot', 'events', filename)]
    }
    const event = require(resolve('src', 'bot', 'events', filename))
    event.name = event.name.replace('.js', '')
    if (event.type === 'once') {
      once.push({ name: event.name, handle: event.handle })
    } else {
      on.push({ name: event.name, handle: event.handle, ...(event.requiredPerms?.length ? { requiredPerms: event.requiredPerms } : {}) })
    }
  })
  return [on, once]
}
