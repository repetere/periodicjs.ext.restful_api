'use strict';
const package = require('../package.json');

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
    version: package.version,
  },
  databases: {
  },
};