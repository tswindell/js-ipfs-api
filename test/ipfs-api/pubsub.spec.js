/* eslint-env mocha */
/* eslint max-nested-callbacks: ['error', 8] */
'use strict'

const expect = require('chai').expect
const isNode = require('detect-node')
const FactoryClient = require('../factory/factory-client')

const useLocalDaemon = true

describe('.pubsub', () => {
  if (!isNode) {
    return
  }

  let ipfs
  let fc

  before(function (done) {
    this.timeout(20 * 1000) // slow CI
    fc = new FactoryClient()
    fc.spawnNode(null, null, useLocalDaemon, (err, node) => {
      expect(err).to.not.exist
      ipfs = node
      done()
    })
  })

  after((done) => {
    fc.dismantle(done)
  })

  it.only('sub', (done) => {
    console.log('1')
    ipfs.pubsub.sub('testi1', (err, result) => {
      console.log('RESULT1', err, result)
      expect(err).to.not.exist
      expect(result.length).to.equal(1)
      done()
    })
    // setTimeout(() => {
    //   ipfs.pubsub.pub('testi1', 'hi')
    // }, 1000)
  })

  describe('.pub', () => {
    it('publishes a message - from string', (done) => {
      const data = 'hello friend'
      ipfs.pubsub.pub('testi1', data, (err, result) => {
        expect(err).to.not.exist
        expect(result).to.equal(true)
        done()
      })
    })

    it('publishes a message - from Buffer', (done) => {
      const data = new Buffer('hello buffer')
      ipfs.pubsub.pub('testi1', data, (err, result) => {
        expect(err).to.not.exist
        expect(result).to.equal(true)
        done()
      })
    })
  })
})
