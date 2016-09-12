'use strict'

const promisify = require('promisify-es6')
const bs58 = require('bs58')
var Base64 = require('js-base64').Base64
// const Wreck = require('wreck')
var http = require('http')
var Writable = require('stream').Writable;

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


      // var ws = Writable();
      var Stream = require('stream');
      var rs = new Stream;
      rs.readable = true;

      // ws._write = function (chunk, enc, next) {
      //   // console.log('>', d.toString())
      //   var parsed = JSON.parse(chunk)
      //   parsed.from = bs58.encode(parsed.from)
      //   parsed.data = Base64.decode(parsed.data)
      //   parsed.seqno = Base64.decode(parsed.seqno)
      //   console.log(parsed)
      //   next();
      // };

      console.log('Sub', topic)
      http.get({
        host: 'localhost',
        port: 5001,
        path: '/api/v0/pubsub/sub/' + topic
      }, function (response) {
        // Continuously update stream with data
        // var body = ''
        // response.pipe
        response.on('data', function (d) {
          // console.log("chunk", d.toString())
          var parsed = JSON.parse(d)
          parsed.from = bs58.encode(parsed.from)
          parsed.data = Base64.decode(parsed.data)
          parsed.seqno = Base64.decode(parsed.seqno)
          // console.log(parsed)
          rs.emit('data', parsed)
          // rs.push(JSON.stringify(parsed))
          // ws.write(d)
          // body += d
        })
        response.on('end', function () {
          rs.emit('end')
          // Data reception is done, do whatever with it!
          // var parsed = JSON.parse(body)
          // console.log(parsed)
          // callback(null, parsed)
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

      //   console.log("THIS IS THE CALLBACK")
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
