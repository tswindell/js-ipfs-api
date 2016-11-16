'use strict'

const ndjson = require('ndjson')
const promisify = require('promisify-es6')

module.exports = (send) => {
  return {
    /**
     * @alias log.tail
     * @method
     * @returns {Promise|undefined}
     * @memberof Api#
     */
    tail: promisify((callback) => {
      return send({
        path: 'log/tail'
      }, (err, response) => {
        if (err) {
          return callback(err)
        }
        callback(null, response.pipe(ndjson.parse()))
      })
    })
  }
}
