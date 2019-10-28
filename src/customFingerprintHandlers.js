const replaceUUIDs = string => string.replace(/[a-f0-9-]{36}/, ':id')

const axiosError = {
  matches: error => error.request && error.response,
  getFingerprint: error => ['{{ default }}', error.response.status, replaceUUIDs(error.request.responseURL)],
  getMessage: error => error.request.responseURL,
}

export default [
  axiosError,
]
