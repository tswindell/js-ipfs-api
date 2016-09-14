'use strict';

var promisify = require('promisify-es6');
var bs58 = require('bs58');
var Base64 = require('js-base64').Base64;
var Stream = require('stream');
var Readable = Stream.Readable;
var http = require('http');

var activeSubscriptions = [];

var subscriptionExists = function subscriptionExists(subscriptions, topic) {
  return subscriptions.indexOf(topic) !== -1;
};
var removeSubscription = function removeSubscription(subscriptions, topic) {
  var indexToRemove = subscriptions.indexOf(topic);
  return subscriptions.filter(function (el, index) {
    return index !== indexToRemove;
  });
};
var addSubscription = function addSubscription(subscriptions, topic) {
  return subscriptions.concat([topic]);
};
var parseMessage = function parseMessage(message) {
  return Object.assign({}, message, {
    from: bs58.encode(message.from),
    data: Base64.decode(message.data),
    seqno: Base64.decode(message.seqno)
  });
};

module.exports = function (send, config) {
  return {
    sub: promisify(function (topic, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }
      if (!options) {
        options = {};
      }

      var rs = new Readable({ objectMode: true });
      rs._read = function () {};

      if (!subscriptionExists(activeSubscriptions, topic)) {
        activeSubscriptions = addSubscription(activeSubscriptions, topic);
      } else {
        return callback(new Error('Already subscribed to ' + topic), null);
      }

      // we're using http.get here to have more control over the request
      // and avoid refactoring of the request-api where wreck is gonna be
      // replaced by fetch (https://github.com/ipfs/js-ipfs-api/pull/355)
      var request = http.get({
        host: config.host,
        port: config.port,
        path: '/api/v0/pubsub/sub/' + topic
      }, function (response) {
        response.on('data', function (d) {
          var data = JSON.parse(d);

          // skip "double subscription" error
          if (!data.Message) {
            rs.emit('data', parseMessage(data));
          }
        });
        response.on('end', function () {
          rs.emit('end');
        });
        rs.cancel = function () {
          request.abort();
          activeSubscriptions = removeSubscription(activeSubscriptions, topic);
        };
      });
      rs.cancel = function () {
        request.abort();
        activeSubscriptions = removeSubscription(activeSubscriptions, topic);
      };
      callback(null, rs);
    }),
    pub: promisify(function (topic, data, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }
      if (!options) {
        options = {};
      }

      var isBuffer = Buffer.isBuffer(data);
      var buf = isBuffer ? data : new Buffer(data);

      send({
        path: 'pubsub/pub',
        args: [topic, buf]
      }, function (err, result) {
        if (err) {
          return callback(err);
        }
        callback(null, true);
      });
    })
  };
};