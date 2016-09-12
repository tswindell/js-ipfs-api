/* eslint-env mocha */
/* eslint max-nested-callbacks: ['error', 8] */
'use strict'

const expect = require('chai').expect
const isNode = require('detect-node')
const FactoryClient = require('../factory/factory-client')
const ipfsApi = require('../../src')

const useLocalDaemon = true

describe('.pubsub', () => {
  if (!isNode) {
    return
  }

  let ipfs
  let fc

  before(function (done) {
    this.timeout(20 * 1000) // slow CI
    // fc = new FactoryClient()
    // fc.spawnNode(null, null, useLocalDaemon, (err, node) => {
    //   console.log("aaaa", err, node)
    //   expect(err).to.not.exist
    //   if(err) done(err)
      ipfs = ipfsApi()
      done()
    // })
  })

  // after((done) => {
  //   // fc.dismantle(done)
  // })

  it.only('sub', (done) => {
    ipfs.pubsub.sub('testi1', (err, result) => {
      expect(err).to.not.exist
      result.on('data', function (d) {
        // console.log("-->", d)
        expect(d.data).to.equal('hi')
        done()
      })
      result.on('end', function () {
        console.log("END!!")
      })
    })
    setTimeout(() => {
      ipfs.pubsub.pub('testi1', 'hi')
    }, 100)
  })

  describe('.pub', () => {
    it.only('publishes a message - from string', (done) => {
      const data = 'hello friend'
      ipfs.pubsub.pub('testi1', data, (err, result) => {
        expect(err).to.not.exist
        expect(result).to.equal(true)
        done()
      })
    })

    it.only('publishes a message - from Buffer', (done) => {
      const data = new Buffer('hello buffer')
      ipfs.pubsub.pub('testi1', data, (err, result) => {
        expect(err).to.not.exist
        expect(result).to.equal(true)
        done()
      })
    })
  })
})
