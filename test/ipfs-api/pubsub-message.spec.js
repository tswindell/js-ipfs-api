/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const isNode = require('detect-node')
const PubsubMessage = require('../../src/pubsub-message')
const PubsubMessageUtils = require('../../src/pubsub-message-utils')

const topicName = 'js-ipfs-api-tests'

// NOTE!
// These tests are skipped for now until we figure out the
// final data types for the messages coming over the wire

describe('.pubsub-message', () => {
  if (!isNode) {
    return
  }

  it.skip('create message', () => {
    // TODO
  })

  it.skip('deserialize message from JSON object', () => {
    const obj = {
      from: 'BI:ۛv�m�uyѱ����tU�+��#���V',
      data: 'aGk=',
      seqno: 'FIlj2BpyEgI=',
      topicIDs: [ topicName ]
    }
    try {
      const message = PubsubMessageUtils.deserialize(obj)
      expect(message.from).to.equal('AAA')
      expect(message.data).to.equal('hi')
      expect(message.seqno).to.equal('\u0014�c�\u001ar\u0012\u0002')
      expect(message.topicIDs.length).to.equal(1)
      expect(message.topicIDs[0]).to.equal(topicName)
    } catch (e) {
      done(e)
    }
  })

  describe('immutable properties', () => {
    const message = PubsubMessageUtils.create('A', 'hello', '123', ['hello world'])

    it('from', () => {
      try {
        message.from = 'not allowed'
      } catch (e) {
        expect(e).to.be.an('error')
        expect(e.toString()).to.equal(`TypeError: Cannot set property from of #<PubsubMessage> which has only a getter`)
      }
    })

    it('data', () => {
      try {
        message.data = 'not allowed'
      } catch (e) {
        expect(e).to.be.an('error')
        expect(e.toString()).to.equal(`TypeError: Cannot set property data of #<PubsubMessage> which has only a getter`)
      }
    })

    it('seqno', () => {
      try {
        message.seqno = 'not allowed'
      } catch (e) {
        expect(e).to.be.an('error')
        expect(e.toString()).to.equal(`TypeError: Cannot set property seqno of #<PubsubMessage> which has only a getter`)
      }
    })

    it('topicIDs', () => {
      try {
        message.topicIDs = ['not allowed']
      } catch (e) {
        expect(e).to.be.an('error')
        expect(e.toString()).to.equal(`TypeError: Cannot set property topicIDs of #<PubsubMessage> which has only a getter`)
      }
    })
  })
})
