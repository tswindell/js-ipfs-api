'use strict'

const promisify = require('promisify-es6')
const bl = require('bl')
const Block = require('ipfs-block')
const multihash = require('multihashes')
const CID = require('cids')

module.exports = (send) => {
  return {
    /**
     * Get a raw IPFS block
     *
     * @alias block.get
     * @method
     * @param {CID|string} args - the multihash or CID of the block.
     * @param {Object} [opts={}]
     * @param {function(Error, Block)} [callback]
     * @returns {Promise<Block>|undefined}
     * @memberof Api#
     */
    get: promisify((args, opts, callback) => {
      // TODO this needs to be adjusted with the new go-ipfs http-api
      if (args && CID.isCID(args)) {
        args = multihash.toB58String(args.multihash)
      }
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }

      return send({
        path: 'block/get',
        args: args,
        qs: opts
      }, (err, res) => {
        if (err) {
          return callback(err)
        }
        if (Buffer.isBuffer(res)) {
          callback(null, new Block(res))
        } else {
          res.pipe(bl((err, data) => {
            if (err) {
              return callback(err)
            }
            callback(null, new Block(data))
          }))
        }
      })
    }),

    /**
     * Print information of a raw IPFS block.
     *
     * @alias block.stat
     * @method
     * @param {CID|string} key - the `base58` multihash or CID of the block.
     * @param {Object} [opts={}]
     * @param {function(Error, {key: string, size: string})} [callback]
     * @returns {Promise<{key: string, size: string}>|undefined}
     * @memberof Api#
     */
    stat: promisify((key, opts, callback) => {
      // TODO this needs to be adjusted with the new go-ipfs http-api
      if (key && CID.isCID(key)) {
        key = multihash.toB58String(key.multihash)
      }

      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'block/stat',
        args: key,
        qs: opts
      }, (err, stats) => {
        if (err) {
          return callback(err)
        }
        callback(null, {
          key: stats.Key,
          size: stats.Size
        })
      })
    }),

    /**
     * Store input as an IPFS block.
     *
     * @alias block.put
     * @method
     * @param {Object} block - The block to create.
     * @param {Buffer} block.data -  The data to be stored as an IPFS block.
     * @param {CID} [cid]
     * @param {function(Error, Block)} [callback]
     * @returns {Promise<Block>|undefined}
     * @memberof Api#
     */
    put: promisify((block, cid, callback) => {
      // TODO this needs to be adjusted with the new go-ipfs http-api
      if (typeof cid === 'function') {
        callback = cid
        cid = {}
      }

      if (Array.isArray(block)) {
        const err = new Error('block.put() only accepts 1 file')
        return callback(err)
      }

      if (typeof block === 'object' && block.data) {
        block = block.data
      }

      return send({
        path: 'block/put',
        files: block
      }, (err, blockInfo) => {
        if (err) {
          return callback(err)
        }
        callback(null, new Block(block))
      })
    })
  }
}
