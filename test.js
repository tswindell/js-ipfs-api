'use strict'

var http = require('http')
var Base64 = require('js-base64').Base64
const bs58 = require('bs58')

http.get({
  host: 'localhost',
  port: 5001,
  path: '/api/v0/pubsub/sub/testi1'
}, function (response) {
  // Continuously update stream with data
  var body = ''
  response.on('data', function (d) {
    // console.log(">", d.toString())
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
    // callback(null, parsed)
  })
})
