import mapValues from 'lodash/mapValues'
import keyBy from 'lodash/keyBy'
import set from 'lodash/set'
import * as client from '@sentry/browser'
import { featureSwitch } from '@rplan/featureswitch-webclient'

import {
  dsn,
  enabled,
  environment,
} from './config'

import fingerprintHandlers from './customFingerprintHandlers'

function getFeatureSwitchTags() {
  try {
    const enabledSwitches = featureSwitch
      .getExistingSwitches()
      .filter(key => featureSwitch.get(key))

    return mapValues(
      keyBy(enabledSwitches, key => `fs:${key}`),
      () => true,
    )
  } catch (e) {
    // intentionally only log in console
    // eslint-disable-next-line no-console
    console.error('error while processing feature switches', e)
    return {}
  }
}

function addTagsToEvent(event, tags) {
  // intentional modification of `event` object
  // eslint-disable-next-line no-param-reassign
  event.tags = event.tags || {}
  // eslint-disable-next-line no-param-reassign
  event.tags = {
    ...event.tags,
    ...tags,
  }
}

function guardAgainstCircularEvent(event, error) {
  try {
    JSON.stringify(event)
  } catch (e) {
    if (e.message.toLowerCase().includes('circular structure')) {
      const circularStructureError = new Error('sentry-client.beforeSend: event contains circular structure, forward original error stack')
      circularStructureError.stack = error.stack
      throw circularStructureError
    }
    throw e
  }
}

const initClient = () => {
  client.init({
    dsn,
    environment,
    enabled,
    release: process.env.GIT_COMMIT,
    beforeSend(event, hint) {
      const tags = getFeatureSwitchTags()
      if (tags) {
        addTagsToEvent(event, tags)
      }

      const error = hint.originalException
      guardAgainstCircularEvent(event, error)

      if ((error != null) && (typeof error === 'object')) {
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
