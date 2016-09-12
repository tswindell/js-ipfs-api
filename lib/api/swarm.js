'use strict';

var promisify = require('promisify-es6');
var multiaddr = require('multiaddr');

module.exports = function (send) {
  return {
    peers: promisify(function (opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }
      send({
        path: 'swarm/peers',
        qs: opts
      }, function (err, result) {
        if (err) {
          return callback(err);
        }
        callback(null, result.Strings.map(function (addr) {
          return multiaddr(addr);
        }));
      });
    }),
    connect: promisify(function (args, opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }
      send({
        path: 'swarm/connect',
        args: args,
        qs: opts
      }, callback);
    }),
    disconnect: promisify(function (args, opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }
      send({
        path: 'swarm/disconnect',
        args: args,
        qs: opts
      }, callback);
    }),
    addrs: promisify(function (opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }
      send({
        path: 'swarm/addrs',
        qs: opts
      }, function (err, result) {
        if (err) {
          return callback(err);
        }
        callback(null, Object.keys(result.Addrs).map(function (id) {
          return result.Addrs[id].map(function (maStr) {
            return multiaddr(maStr).encapsulate('/ipfs/' + id);
          });
        })[0]);
      });
    }),
    localAddrs: promisify(function (opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }
      send({
        path: 'swarm/addrs/local',
        qs: opts
      }, function (err, result) {
        if (err) {
          return callback(err);
        }
        callback(null, result.Strings.map(function (addr) {
          return multiaddr(addr);
        }));
      });
    })
  };
};