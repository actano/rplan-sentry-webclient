const replaceUUIDs = string => string.replace(/[a-f0-9-]{36}/, ':id')

const axiosError = {
  matches: error => error.request && error.response && error.config,
  getFingerprint: error => ['{{ default }}', error.config.method, replaceUUIDs(error.config.url), error.response.status],
  getMessage: error => `${error.config.method} ${error.config.url}: ${error.response.status}`,
}

export default [
  axiosError,
]