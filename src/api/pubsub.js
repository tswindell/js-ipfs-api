'use strict'

const promisify = require('promisify-es6')
const bs58 = require('bs58')
var Base64 = require('js-base64').Base64
var Stream = require('stream')
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


      var rs = new Stream()
      rs.readable = true

      console.log('Sub', topic)
      http.get({
        host: 'localhost',
        port: 5001,
        path: '/api/v0/pubsub/sub/' + topic
      }, function (response) {
        response.on('data', function (d) {
          var parsed = JSON.parse(d)

          // skip "double subscription" error
          if(!parsed.Message) {
            parsed.from = bs58.encode(parsed.from)
            parsed.data = Base64.decode(parsed.data)
            parsed.seqno = Base64.decode(parsed.seqno)
            rs.emit('data', parsed)
          }
        })
        response.on('end', function () {
          rs.emit('end')
        })

        callback(null, rs)
      })

      // send({
      //   path: 'pubsub/sub/' + topic
      // }, (err, response) => {
      //   console.log('RESULT', err, response)
      //   if (err) {
      //     return callback(err)
      //   }

      //   callback(null, response.pipe(ndjson.parse()))
      //   // callback(null, result) // result is a Stream
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
        args: [topic, buf]
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
