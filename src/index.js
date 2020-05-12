import set from 'lodash/set'
import * as client from '@sentry/browser'

import {
  dsn,
  enabled,
  environment,
} from './config'

import fingerprintHandlers from './customFingerprintHandlers'

const initClient = () => {
  client.init({
    dsn,
    environment,
    enabled,
    release: process.env.GIT_COMMIT,
    beforeSend(event, hint) {
      const error = hint.originalException

      if (typeof error === 'object') {
        const handler = fingerprintHandlers.find(h => h.matches(error))

        // see: https://docs.sentry.io/data-management/event-grouping/sdk-fingerprinting/?platform=javascript
        if (handler) {
          if (!handler.handleError(error)) {
            return undefined
          }
          const fingerprint = handler.getFingerprint(error)
          const message = handler.getMessage(error)

          set(event, 'fingerprint', fingerprint)
          if (message) {
            set(event, 'exception.values[0].value', message)
          }
        }
      }

      return event
    },
  })
}

export {
  initClient,
  client,
}
