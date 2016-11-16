'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  /**
   * @alias ping
   * @method
   * @returns {Promise|undefined}
   * @memberof Api#
   */
  return promisify((id, callback) => {
    send({
      path: 'ping',
      args: id,
      qs: { n: 1 }
    }, function (err, res) {
      if (err) {
        return callback(err, null)
      }
      callback(null, res[1])
    })
  })
}
