import get from 'lodash/get'

const replaceUUIDs = string => string.replace(/[a-f0-9-]{36}/, ':id')

const extractUrlPath = (urlString) => {
  const url = new URL(urlString)
  const path = `${url.host}${url.pathname}`
  return path
}

const getStatusDetail = (error) => {
  const contentType = get(error, ['response', 'headers', 'content-type'])

  if (contentType === 'text/plain') {
    return error.response.data
  }

  return ''
}

const axiosError = {
  matches: error => !!error.request && !!error.response && !!error.config,
  handleError: error => ![401, 403].includes(error.response.status),
  getFingerprint: error => [
    '{{ default }}',
    error.config.method,
    extractUrlPath(replaceUUIDs(error.config.url)),
    error.response.status,
    getStatusDetail(error),
  ],
  getMessage(error) {
    const statusText = `${error.response.status} ${getStatusDetail(error)}`.trim()
    return `${statusText}: ${error.config.method} ${error.config.url}`
  },
}

const axiosNetworkError = {
  matches: error => !!error.request && (error.response == null) && !!error.config,
  handleError: () => true,
  getFingerprint: error => [
    '{{ default }}',
    'Network Error',
    error.config.method,
    extractUrlPath(replaceUUIDs(error.config.url)),
  ],
  getMessage(error) {
    return `Network Error: ${error.config.method} ${error.config.url}`
  },
}

export default [
  axiosError,
  axiosNetworkError,
]
