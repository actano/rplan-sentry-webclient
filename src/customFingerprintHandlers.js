const replaceUUIDs = string => string.replace(/[a-f0-9-]{36}/, ':id')

const axiosError = {
  matches: error => !!error.request && !!error.response && !!error.config,
  handleError: error => ![401, 403].includes(error.response.status),
  getFingerprint: error => ['{{ default }}', error.config.method, replaceUUIDs(error.config.url), error.response.status],
  getMessage: error => `${error.response.status}: ${error.config.method} ${error.config.url}`,
}

export default [
  axiosError,
]
