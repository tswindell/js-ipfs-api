'use strict'

const promisify = require('promisify-es6')
const bs58 = require('bs58')
var Base64 = require('js-base64').Base64
// const Wreck = require('wreck')
var http = require('http')

module.exports = (send) => {
  const api = {
    sub: promisify((topic, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      if (!options) {
        options = {}
      }

      console.log('Sub', topic)
      http.get({
        host: 'localhost',
        port: 5001,
        path: '/api/v0/pubsub/sub/' + topic
      }, function (response) {
        // Continuously update stream with data
        var body = ''
        response.on('data', function (d) {
          // console.log('>', d.toString())
          var parsed = JSON.parse(d)
          parsed.from = bs58.encode(parsed.from)
          parsed.data = Base64.decode(parsed.data)
          parsed.seqno = Base64.decode(parsed.seqno)
          console.log(parsed)
          body += d
        })
        response.on('end', function () {
          // Data reception is done, do whatever with it!
          var parsed = JSON.parse(body)
          console.log(parsed)
          callback(null, parsed)
        })
      })

      // Wreck.get('http://localhost:5001/api/v0/pubsub/sub/' + topic, (err, res, payload) => {
      //   if (err) {
      //     return callback(err)
      //   }

      //   console.log(payload.toString())
      //   // const result = JSON.parse(res)
      //   callback(null, payload)
      // })

      // send({
      //   path: 'pubsub/sub/' + topic
      // }, (err, result) => {
      //   console.log('RESULT', err, result)
      //   if (err) {
      //     return callback(err)
      //   }

      //   callback(null, result) // result is a Stream
      // })
    }),
    pub: promisify((topic, data, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      if (!options) {
        options = {}
      }

      let buf
      if (Buffer.isBuffer(data)) {
        buf = data
      } else {
        buf = new Buffer(data)
      }

      send({
        path: 'pubsub/pub',
        qs: { topic: topic },
        files: buf
      }, (err, result) => {
        if (err) {
          return callback(err)
        }

        callback(null, true)
      })
    })
  }

  return api
}
