'use strict';
const periodic = require('periodicjs');
const utilities = require('./utilities');
const logger = periodic.logger;

module.exports = () => {
  periodic.status.on('configuration-complete', () => {
    const extensionSettings = periodic.settings.extensions[ 'periodicjs.ext.restful_api' ];

    utilities.init.api()
      .then(() => {
        logger.silly('initialized restful routes');
      })
      .catch(logger.error);
    extensionSettings.initialization_status_events.forEach(initializationEvent => {
      periodic.status.on(initializationEvent, () => { 
        utilities.init.api()
          .then(() => {
            logger.silly('re-initialized restful routes after '+initializationEvent);
          })
          .catch(logger.error);
      });
    });
  });

  return Promise.resolve(true);
};