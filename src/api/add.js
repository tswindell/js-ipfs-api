'use strict'

const isStream = require('isstream')
const addToDagNodesTransform = require('../add-to-dagnode-transform')
const promisify = require('promisify-es6')

module.exports = (send) => {
  /**
   * Add content to IPFS.
   *
   * @alias add
   * @method
   * @param {(Buffer|Stream|Array<Buffer|Stream>)} files - The content to add.
   * @param {function(Error, {hash: string})} [callback]
   * @returns {Promise<{hash: string}>|undefined}
   *
   * @memberof Api#
   *
   * @example
   * api.add(new Buffer('hello world')).then((res) => {
   *   console.log('saved with hash %s', res.hash)
   * })
   *
   */
  return promisify((files, callback) => {
    const good = Buffer.isBuffer(files) ||
               isStream.isReadable(files) ||
               Array.isArray(files)

    if (!good) {
      callback(new Error('"files" must be a buffer, readable stream, or array of objects'))
    }

    const sendWithTransform = send.withTransform(addToDagNodesTransform)

    return sendWithTransform({
      path: 'add',
      files: files
    }, callback)
  })
}
