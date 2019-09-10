import sinon from 'sinon'
import chai from 'chai'
import sinonChai from 'sinon-chai'
import * as client from '@sentry/browser'

import { initClient } from '../src'
import { dsn, environment, enabled } from '../src/config'

chai.use(sinonChai)
const { expect } = chai

describe('@rplan/sentry-webclient', () => {
  const sandbox = sinon.createSandbox()
  let initStub

  beforeEach(() => {
    initStub = sandbox.stub(client, 'init')
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('initClient', () => {
    it('should call the init from sentry with the right params', () => {
      initClient()

      expect(initStub).to.have.been.calledWith({
        dsn,
        environment,
        enabled,
      })
    })
  })
})
