import pickBy from 'lodash/pickBy'
import mapValues from 'lodash/mapValues'
import keyBy from 'lodash/keyBy'
import set from 'lodash/set'
import safeCloneDeep from 'safe-clone-deep'
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

function sanitizeCircularReferences(obj) {
  try {
    JSON.stringify(obj)
  } catch (err) {
    if (err.message.toLowerCase().includes('circular structure')) {
      const sanitizedDeepClone = safeCloneDeep(obj)
      for (const key of Object.keys(obj)) {
        // the sanitizing needs to happen in place
        // eslint-disable-next-line no-param-reassign
        obj[key] = sanitizedDeepClone[key]
      }
    } else {
      throw err
    }
  }
}

function filterEventTagsForNull(event) {
  // eslint-disable-next-line no-param-reassign
  event.tags = event.tags || {}
  // eslint-disable-next-line no-param-reassign
  event.tags = pickBy(
    event.tags,
    (value, key) => key != null,
  )
}

const initClient = () => {
  client.init({
    dsn,
    environment,
    enabled,
    release: process.env.GIT_COMMIT,
    beforeSend(event, hint) {
      sanitizeCircularReferences(event)

      const tags = getFeatureSwitchTags()
      if (tags) {
        addTagsToEvent(event, tags)
      }

      const error = hint.originalException

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

      filterEventTagsForNull(event)

      return event
    },
  })
}

export {
  initClient,
  client,
}
