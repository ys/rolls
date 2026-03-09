'use strict';

exports.config = {
  app_name: [process.env.NEW_RELIC_APP_NAME || 'rolls'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY || '',
  logging: {
    level: 'info',
  },
  distributed_tracing: {
    enabled: true,
  },
  application_logging: {
    forwarding: {
      enabled: true,
    },
  },
};
