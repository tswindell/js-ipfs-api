'use strict'

const promisify = require('promisify-es6')
const bs58 = require('bs58')
var Base64 = require('js-base64').Base64
var Stream = require('stream')
var http = require('http')

let activeSubscriptions = []

const subscriptionExists = (subscriptions, topic) => {
  return subscriptions.indexOf(topic) !== -1
}
const removeSubscription = (subscriptions, topic) => {
  const indexToRemove = subscriptions.indexOf(topic)
  return subscriptions.filter((el, index) => {
    return index !== indexToRemove
  })
}
const addSubscription = (subscriptions, topic) => {
  return subscriptions.concat([topic])
}

module.exports = (send, config) => {
  return {
    sub: promisify((topic, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      if (!options) {
        options = {}
      }

      var rs = new Stream()
      rs.readable = true

      if (!subscriptionExists(activeSubscriptions, topic)) {
        activeSubscriptions = addSubscription(activeSubscriptions, topic)
      } else {
        return callback(new Error('Already subscribed to ' + topic), null)
      }

      // we're using http.get here to have more control over the request
      // and avoid refactoring of the request-api where wreck is gonna be
      // replaced by fetch (https://github.com/ipfs/js-ipfs-api/pull/355)
      const request = http.get({
        host: config.host,
        port: config.port,
        path: '/api/v0/pubsub/sub/' + topic
      }, function (response) {
        response.on('data', function (d) {
          var parsed = JSON.parse(d)

          // skip "double subscription" error
          if (!parsed.Message) {
            parsed.from = bs58.encode(parsed.from)
            parsed.data = Base64.decode(parsed.data)
            parsed.seqno = Base64.decode(parsed.seqno)
            rs.emit('data', parsed)
          }
        })
        response.on('end', function () {
          rs.emit('end')
        })
        rs.cancel = () => {
          request.abort()
          activeSubscriptions = removeSubscription(activeSubscriptions, topic)
        }
      })
      rs.cancel = () => {
        request.abort()
        activeSubscriptions = removeSubscription(activeSubscriptions, topic)
      }
      callback(null, rs)
    }),
    pub: promisify((topic, data, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      if (!options) {
        options = {}
      }

      const isBuffer = Buffer.isBuffer(data)
      const buf = isBuffer ? data : new Buffer(data)

      send({
        path: 'pubsub/pub',
        args: [topic, buf]
      }, (err, result) => {
        if (err) {
          return callback(err)
        }
        callback(null, true)
      })
    })
  }
}
