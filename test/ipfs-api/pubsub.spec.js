/* eslint-env mocha */
/* eslint max-nested-callbacks: ['error', 8] */
'use strict'

const expect = require('chai').expect
const isNode = require('detect-node')
const FactoryClient = require('../factory/factory-client')

const topicName = 'js-ipfs-api-tests'

const publish = (ipfs, data, callback) => {
  ipfs.pubsub.pub(topicName, data, (err, result) => {
    expect(err).to.not.exist
    expect(result).to.equal(true)
    callback()
  })
}

describe('.pubsub', () => {
  if (!isNode) {
    return
  }

  let ipfs
  let fc

  before(function (done) {
    fc = new FactoryClient()
    fc.spawnNode((err, node) => {
      expect(err).to.not.exist
      if (err) done(err)
      ipfs = node
      done()
    })
  })

  after((done) => {
    fc.dismantle(done)
  })

  describe('.publish', () => {
    it('message from string', (done) => {
      publish(ipfs, 'hello friend', done)
    })
    it('message from buffer', (done) => {
      publish(ipfs, new Buffer('hello friend'), done)
    })
  })

  describe('.subscribe', () => {
    it('one topic', (done) => {
      ipfs.pubsub.sub(topicName, (err, subscription) => {
        expect(err).to.not.exist
        subscription.on('data', (d) => {
          expect(d.data).to.equal('hi')
          subscription.cancel()
        })
        subscription.on('end', () => {
          done()
        })
      })
      setTimeout(publish.bind(null, ipfs, 'hi', () => {}), 0)
    })
    it('fails when already subscribed', (done) => {
      ipfs.pubsub.sub(topicName, (firstErr, firstSub) => {
        expect(firstErr).to.not.exist
        ipfs.pubsub.sub(topicName, (secondErr, secondSub) => {
          expect(secondErr).to.be.an('error')
          expect(secondErr.toString()).to.equal('Error: Already subscribed to ' + topicName)
          firstSub.cancel()
          done()
        }).catch(done)
      }).catch(done)
    })
    it('receive multiple messages', (done) => {
      let receivedMessages = []
      let interval = null
      const expectedMessages = 2
      ipfs.pubsub.sub(topicName, (err, subscription) => {
        expect(err).to.not.exists
        subscription.on('data', (d) => {
          receivedMessages.push(d.data)
          if (receivedMessages.length === expectedMessages) {
            receivedMessages.forEach((msg) => {
              expect(msg).to.be.equal('hi')
            })
            clearInterval(interval)
            subscription.cancel()
            done()
          }
        })
      }).catch(done)

      setTimeout(() => {
        interval = setInterval(publish.bind(null, ipfs, 'hi', () => {}), 10)
      }, 10)
    })
  })
})
