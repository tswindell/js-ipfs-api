'use strict'

const promisify = require('promisify-es6')
const pubsubMessageStream = require('../pubsub-message-stream')

/* Internal subscriptions state and functions */
let subscriptions = {}

const addSubscription = (topic, request) => {
  subscriptions[topic] = { request: request }
}

const removeSubscription = promisify((topic, callback) => {
  if (!subscriptions[topic]) {
    return callback(new Error(`Not subscribed to ${topic}`))
  }

  subscriptions[topic].request.abort()
  delete subscriptions[topic]

  if (callback) {
    callback(null)
  }
})

/* Public API */
module.exports = (send, config) => {
  return {
    subscribe: promisify((topic, options, callback) => {
      const defaultOptions = {
        discover: false
      }

      if (typeof options === 'function') {
        callback = options
        options = defaultOptions
      }

      if (!options) {
        options = defaultOptions
      }

      // If we're already subscribed, return an error
      if (subscriptions[topic]) {
        return callback(new Error(`Already subscribed to '${topic}'`))
      }

      // Request params
      const request = {
        path: 'pubsub/sub',
        args: [topic],
        qs: { discover: options.discover }
      }

      // Start the request
      const req = send(request, (err, response) => {
        if (err) {
          return callback(err)
        }

        // Bubble the 'end' event
        response.on('end', () => stream.emit('end'))

        // Create a response stream that we'll pass back to the caller in callback
        const stream = response.pipe(pubsubMessageStream())
        stream.cancel = promisify((callback) => removeSubscription(topic, callback))

        // Add the request to the active subscriptions and return the stream
        addSubscription(topic, req)
        callback(null, stream)
      })
    }),
    publish: promisify((topic, data, callback) => {
      const buf = Buffer.isBuffer(data) ? data : new Buffer(data)

      const request = {
        path: 'pubsub/pub',
        args: [topic, buf]
      }

      send(request, callback)
    }),
    ls: promisify((callback) => {
      const request = {
        path: 'pubsub/ls'
      }

      send(request, (err, topics) => {
        callback(err, topics.Strings || [])
      })
    }),
    peers: promisify((topic, callback) => {
      if (!subscriptions[topic]) {
        return callback(new Error(`Not subscribed to '${topic}'`))
      }

      const request = {
        path: 'pubsub/peers',
        args: [topic]
      }

      send(request, (err, peers) => {
        callback(err, peers.Strings || [])
      })
    })
  }
}
