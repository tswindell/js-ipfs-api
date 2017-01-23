'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return {
    list: promisify((opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'exp/corenet/list',
        args: [],
        qs: opts
      }, callback)
    }),
    listen: promisify((proto, addr, opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'exp/corenet/listen',
        args: [proto, addr],
        qs: opts
      }, callback)
    }),
    dial: promisify((peer, proto, bind, opts, callback) => {
      var args = [peer, proto, bind]
      if (bind === undefined) {
        args.pop()
      }
      if (typeof (bind) === 'function') {
        callback = bind
        args.pop()
        opts = {}
      }
      if (typeof (opts) === 'function') {
        callback = opts
        bind = undefined
        opts = {}
      }
      send({
        path: 'exp/corenet/dial',
        args: args,
        qs: opts
      }, callback)
    }),
    close: promisify((handlerId, opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'exp/corenet/close',
        args: [handlerId],
        qs: opts
      }, callback)
    })
  }
}
