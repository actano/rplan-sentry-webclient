import config from '@rplan/config-webclient'

export const dsn = config.get('sentry_dsn') || ''
export const enabled = config.get('sentry_enabled') || false
export const environment = config.get('sentry_environment') || ''
