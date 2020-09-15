# rplan-sentry-webclient

This module provides a convenient configuration of the sentry [`sentry`](https://github.com/getsentry/sentry-javascript)
Sentry client for usage in the [`rplan-webclient`](https://github.com/actano/rplan-webclient) and
related modules.

It currently provides the following features:
* It exports the `sentry` API as is, no wrapper, no modifications.
* Convenience function to init sentry witch set some configuration from [webclient config](https://github.com/actano/rplan-webclient/blob/cf3c904591d9041dd9a2253bbb29d144106bab12/.rplan-config.yml#L6-L8)

## Example usage
``` 
    import { client as sentryClient } from '@rplan/sentry-webclient'
....
    sentryClient.withScope((scope) => {
      scope.setTag('type', 'updateProject')
      scope.setExtra('module', 'allex-planning-objects-components')
      scope.setLevel(sentryClient.Severity.Error)
      sentryClient.captureException(err)
    })
```

## Activate sentry locally
- set the sentry props in the rplan-webclient config
    - sentry_enabled: true
    - sentry_dsn: XXX
    (` vault read secret/rplanx/sentry`)
- restart the dev server

The resulting events of the local environment can then be seen here: 
[Sentry local issues](https://sentry.io/organizations/actano-gmbh/issues/?environment=local&project=1552629)
