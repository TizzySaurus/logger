const { displayUser } = require("./constants")

module.exports = {
  getEmbedFooter (user) {
    return {
      text: `${displayUser(user)}`,
      icon_url: user.dynamicAvatarURL(null, 64)
    }
  },
  getAuthorField (user) {
    return {
      name: `${displayUser(user)}`,
      icon_url: user.avatarURL
    }
  }
}
