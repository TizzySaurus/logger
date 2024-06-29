const { readdirSync } = require('fs')
const { resolve } = require('path')
const GenericCommand = require('../bot/bases/GenericCommand')

module.exports = () => {
  const files = readdirSync(resolve('src', 'bot', 'commands'))
  files.forEach(filename => {
    if (require.cache[resolve('src', 'bot', 'commands', filename)]) {
      delete require.cache[resolve('src', 'bot', 'commands', filename)]
    }
    // truly gross code that should be remade eventually
    new GenericCommand(require(resolve('src', 'bot', 'commands', filename)))
  })
}
