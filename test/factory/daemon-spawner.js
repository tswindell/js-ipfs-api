'use strict'

// const defaultConfig = require('./default-config.json')
const ipfsd = require('ipfsd-ctl')
const series = require('async/series')
const eachSeries = require('async/eachSeries')
const once = require('once')

module.exports = Factory

function Factory () {
  if (!(this instanceof Factory)) {
    return new Factory()
  }

  let nodes = []

  this.spawnNode = (repoPath, config, useLocalDaemon, callback) => {
    if (typeof repoPath === 'function') {
      callback = repoPath
      repoPath = undefined
    }
    if (typeof config === 'function') {
      callback = config
      config = undefined
    }

    // if (!repoPath) {
    //   repoPath = '/tmp/.ipfs-' + Math.random()
    //                             .toString()
    //                             .substring(2, 8)
    // }

    // TODO
    //   - [ ] Support custom repoPath
    //   - [ ] Support custom config
    // This will come once the new ipfsd-ctl is
    // complete: https://github.com/ipfs/js-ipfsd-ctl/pull/89

    if (useLocalDaemon) {
      spawnLocalNode((err, node) => {
        if (err) {
          return callback(err)
        }
        nodes.push(node)
        callback(null, node.apiAddr)
      })
    } else {
      spawnEphemeralNode((err, node) => {
        if (err) {
          return callback(err)
        }
        nodes.push(node)
        callback(null, node.apiAddr)
      })
    }
  }

  this.dismantle = (callback) => {
    eachSeries(nodes, (node, cb) => {
      cb = once(cb)
      node.stopDaemon(cb)
    }, (err) => {
      if (err) {
        return callback(err)
      }
      nodes = []

      callback()
    })
  }
}

function spawnLocalNode (callback) {
  console.log("Spawn local node")
  ipfsd.local((err, node) => {
    if (err) {
      return callback(err)
    }

  console.log("start daemon")
    node.startDaemon((err, ipfs) => {
  console.log("started")
      if (err) {
        return callback(err)
      }

      callback(null, node)
    })
  })
}

function spawnEphemeralNode (callback) {
  ipfsd.disposable((err, node) => {
    if (err) {
      return callback(err)
    }
    // Note: we have to set each config value
    // independently since the config/replace endpoint
    // doesn't work as expected
    series([
      (cb) => {
        const configValues = {
          Bootstrap: [],
          Discovery: {},
          'HTTPHeaders.Access-Control-Allow-Origin': ['*'],
          'HTTPHeaders.Access-Control-Allow-Credentials': 'true',
          'HTTPHeaders.Access-Control-Allow-Methods': ['PUT', 'POST', 'GET']
        }

        eachSeries(Object.keys(configValues), (configKey, cb) => {
          node.setConfig(`API.${configKey}`, JSON.stringify(configValues[configKey]), cb)
        }, cb)
      },
      (cb) => node.startDaemon(cb)
    ], (err) => {
      if (err) {
        return callback(err)
      }

      callback(null, node)
    })
  })
}
