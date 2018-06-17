'use strict';
const periodic = require('periodicjs');

module.exports = () => {
  periodic.status.on('configuration-complete', (status) => {
    const extensionSettings = periodic.settings.extensions[ 'periodicjs.ext.restful_api' ];

    utilities.init.apis()
      .then(() => {
        logger.silly('initialized restful routes');
      })
      .catch(logger.error);
    extensionSettings.initialization_status_events.forEach(initializationEvent => {
      utilities.init.apis()
      .then(() => {
        logger.silly('re-initialized restful routes after '+initializationEvent);
      })
      .catch(logger.error);
    })
  });

  return Promise.resolve(true);
}