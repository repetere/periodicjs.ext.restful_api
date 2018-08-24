'use strict';
const packageJSON = require('../package.json');
const periodic = require('periodicjs');

module.exports = {
  settings: {
    encryption_key_path: periodic.settings.application.server.https.ssl.private_key,
    initialization_status_events: [
      'extension-periodicjs.ext.dynamic_core_data-configured',
    ], 
    authentication: {
      accounts:'ensureApiAuthenticated',
      assets:'ensureApiAuthenticated',
      clients:'ensureApiAuthenticated',
      crons:'ensureApiAuthenticated',
      cronhoststatuses:'ensureApiAuthenticated',
      layouts:'ensureApiAuthenticated',
      layoutitems:'ensureApiAuthenticated',
      userroles:'ensureApiAuthenticated',
      userprivileges:'ensureApiAuthenticated',
      users:'ensureApiAuthenticated',
      // tags:'isClientAuthenticated',
      // categories:'ensureAuthenticated',
    },
    exclude_core_datas: [
      'configuration',
      'extension',
      'standard_featuredefinition',
      'standard_transactionmap',
      'standard_cronhoststatus',
      'standard_code',
      'standard_token',
      'dynamicdb_coredatadb',
      'dynamicdb_coredatamodel',
      'dblog_logger',
      'dynamicapi_api',
      'standard_client',
    ],
    additional_routes: [
      // {
      //   core_data_name: 'standard_layout',
      //   authentication_function_name: 'ensureApiAuthenticated',
      //   mount_path:'auth_layouts',
      // }
    ],
    route_path: 'api',
    version: packageJSON.version.split('.')[0],
  },
  databases: {
  },
};