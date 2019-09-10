# rplan-sentry-webclient

This module provides a convenient configuration of the sentry [`sentry`](https://github.com/getsentry/sentry-javascript)
Sentry client for usage in the [`rplan-webclient`](https://github.com/actano/rplan-webclient) and
related modules.

It currently provides the following features:
* It exports the `sentry` API as is, no wrapper, no modifications.
* Convenience function to init sentry witch set some configuration from [webclient config](https://github.com/actano/rplan-webclient/blob/cf3c904591d9041dd9a2253bbb29d144106bab12/.rplan-config.yml#L6-L8)
