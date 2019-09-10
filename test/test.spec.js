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
  const currentEnv = process.env
  let initStub

  beforeEach(() => {
    initStub = sandbox.stub(client, 'init')
    process.env.GIT_COMMIT = 'any-hash'
  })

  afterEach(() => {
    sandbox.restore()
    process.env = currentEnv
  })

  describe('initClient', () => {
    it('should call the init from sentry with the right params', () => {
      initClient()

      expect(initStub).to.have.been.calledWith({
        dsn,
        environment,
        enabled,
        release: 'any-hash',
      })
    })
  })
})
