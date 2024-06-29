const { post } = require("superagent")

/**
 * @description Creates a hastebin link for archive and messageBulkDelete event
 * @param {string} str 
 * @returns {Promise<string | null>}
 */
module.exports.createHaste = async (str = `No data provided`) => {
    if (!process.env.PASTE_SITE_ROOT_URL) { // If there is no haste set, just ignore.
        return null;
    }
    const url = `${process.env.PASTE_SITE_ROOT_URL.endsWith("/") ? process.env.PASTE_SITE_ROOT_URL.slice(0, -1) : process.env.PASTE_SITE_ROOT_URL}`;
    return new Promise((r) => {
        post(`${url}/documents`)
        .set('Authorization', process.env.PASTE_SITE_TOKEN ?? '')
        .set('Content-Type', 'text/plain')
        .send(str)
        .end((err, res) => {
            if (!err && res.statusCode === 200 && res.body.key) {
              return r(`${url}/${res.body.key}.txt`);
            } else {
              global.logger.error(err, res.body)
              global.webhook.error('An error has occurred while posting to the paste website. Check logs for more.')
              return r(null);
            }
          })
    })
}