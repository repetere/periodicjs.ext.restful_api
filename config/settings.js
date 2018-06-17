'use strict';
const packageJSON = require('../package.json');

module.exports = {
  settings: {
    initialization_status_events: [
      'extension-periodicjs.ext.dynamic_core_data-configured',
    ], 
    authentication: {
      standard_user:'ensureApiAuthenticated',
      standard_tag:'isClientAuthenticated',
      standard_category:'ensureAuthenticated',
    },
    exclude_core_datas: [
      'configuration',
      'extension',
    ],
    route_path: 'api',
    version: packageJSON.version.split('.')[0],
  },
  databases: {
  },
};