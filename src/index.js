import * as client from '@sentry/browser'

import {
  dsn,
  enabled,
  environment,
} from './config'

const initClient = () => {
  client.init({
    dsn,
    environment,
    enabled,
    release: process.env.GIT_COMMIT,
  })
}

export {
  initClient,
  client,
}
