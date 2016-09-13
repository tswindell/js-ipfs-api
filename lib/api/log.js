'use strict';

var ndjson = require('ndjson');
var promisify = require('promisify-es6');

module.exports = function (send) {
  return {
    tail: promisify(function (callback) {
      send({
        path: 'log/tail'
      }, function (err, response) {
        if (err) {
          return callback(err);
        }
        callback(null, response.pipe(ndjson.parse()));
      });
    })
  };
};