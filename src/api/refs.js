'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  /**
   * @alias refs
   * @method
   * @returns {Promise|undefined}
   * @memberof Api#
   */
  const refs = promisify((args, opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }
    return send({
      path: 'refs',
      args: args,
      qs: opts
    }, callback)
  })

  /**
   * @alias refs.local
   * @method
   * @returns {Promise|undefined}
   * @memberof Api#
   */
  refs.local = promisify((opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }
    return send({
      path: 'refs',
      qs: opts
    }, callback)
  })

  return refs
}
