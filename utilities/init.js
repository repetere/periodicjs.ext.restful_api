'use strict';
const periodic = require('periodicjs');
const periodicContainerSettings = periodic.settings.container;
const CONTAINER_NAME = periodicContainerSettings.name;
const extensionRouter = periodic.express.Router();
const mountedAPIRoutes = new Map();
const pluralize = require('pluralize');

const authenticationMap = {
  ensureApiAuthenticated: {
    type: 'extension',
    name:'periodicjs.ext.oauth2server',
  },
  isClientAuthenticated: {
    type: 'extension',
    name:'periodicjs.ext.oauth2server',
  },
  isJWTAuthenticated: {
    type: 'extension',
    name:'periodicjs.ext.oauth2server',
  },
  ensureAuthenticated: {
    type: 'extension',
    name:'periodicjs.ext.passport',
  },
}

function getAuthenticationController(options = {}) {
  const { core_data_name, } = options;
  const restfulAPISettings = periodic.settings.extensions['periodicjs.ext.restful_api'];
  let defaultAuthenticationController = periodic.controllers.extension.get('periodicjs.ext.oauth2server').auth.isClientAuthenticated;
  try {
    const authenticationFunctionName = restfulAPISettings.authentication[ core_data_name ];
    const functionMapObject = authenticationMap[ authenticationFunctionName ];
    if (functionMapObject) {
      return periodic.controllers[functionMapObject.type].get(functionMapObject.name).auth[authenticationFunctionName];
    } else if(authenticationFunctionName) {
      return periodic.controllers.container.get(CONTAINER_NAME).auth[authenticationFunctionName];
    } else {
      return defaultAuthenticationController;
    }
  } catch (e) {
    periodic.logger.error(e);
    return defaultAuthenticationController;
  }
}

function api(options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const restfulAPISettings = periodic.settings.extensions['periodicjs.ext.restful_api'];
      // console.log('ADDING ROUTES',{restfulAPISettings});

      periodic.routers.forEach((value, key) => {
        if (key.indexOf('_default_') === -1
          && key.indexOf('extension_') === -1
          && key.indexOf('container_') === -1
          && mountedAPIRoutes.has(key) === false
          && restfulAPISettings.exclude_core_datas.indexOf(key) === -1
        ) {
          const entity_plural_name = pluralize(key.replace(`${value.router_base}_`, '')); //standard_user => users
          const authenticationController = getAuthenticationController({ core_data_name: entity_plural_name, });
          mountedAPIRoutes.set(key, true);
          // console.log({
          //   key,
          //   entity_plural_name,
          //   // value,
          //   authenticationController
          // })
          // console.log({ key, authenticationController },`/${restfulAPISettings.route_path}/v${restfulAPISettings.version}`
            // , value.router
          // );
          // console.log(value.router);
          extensionRouter.use(`/${entity_plural_name}`,authenticationController);
          extensionRouter.use(value.router);
        }
      });
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  api,
  mountedAPIRoutes,
  authenticationMap,
  getAuthenticationController,
  extensionRouter,
};

