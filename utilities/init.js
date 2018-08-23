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
};

function getAuthenticationController(options = {}) {
  const { core_data_name, authentication_function_name, } = options;
  const restfulAPISettings = periodic.settings.extensions[ 'periodicjs.ext.restful_api' ];
  const defaultFunctionName = 'isClientAuthenticated';
  const defaultAuthenticationController = periodic.controllers.extension.get('periodicjs.ext.oauth2server').auth.isClientAuthenticated;
  try {
    const authenticationFunctionName = authentication_function_name || restfulAPISettings.authentication[ core_data_name ];
    const functionMapObject = authenticationMap[ authenticationFunctionName ];
    if (functionMapObject) {
      return {
        controller: periodic.controllers[ functionMapObject.type ].get(functionMapObject.name).auth[ authenticationFunctionName ],
        name:authenticationFunctionName,
      };
    } else if(authenticationFunctionName) {
      return {
        controller: periodic.controllers.container.get(CONTAINER_NAME).auth[ authenticationFunctionName ],
        name:authenticationFunctionName,
      };
    } else {
      return {
        controller: defaultAuthenticationController,
        name: defaultFunctionName,
      };
    }
  } catch (e) {
    periodic.logger.error(e);
    return {
      controller: defaultAuthenticationController,
      name: defaultFunctionName,
    };
  }
}


function api(options = {}) {
  const { additional_api_routes = [], } = options;
  return new Promise((resolve, reject) => {
    try {
      const restfulAPISettings = periodic.settings.extensions['periodicjs.ext.restful_api'];
      // console.log('ADDING ROUTES',{restfulAPISettings});
      const additional_routes = [].concat(restfulAPISettings.additional_routes, additional_api_routes);
      periodic.routers.forEach((value, key) => {
        if (key.indexOf('_default_') === -1
          && key.indexOf('extension_') === -1
          && key.indexOf('container_') === -1
          && mountedAPIRoutes.has(key) === false
          && restfulAPISettings.exclude_core_datas.indexOf(key) === -1
        ) {
          const entity_plural_name = pluralize(key.replace(`${value.router_base}_`, '')); //standard_user => users
          const authenticationController = getAuthenticationController({ core_data_name: entity_plural_name, });
          mountedAPIRoutes.set(key, authenticationController.name);
          // console.log({
          //   key,
          //   entity_plural_name,
          //   // value,
          //   authenticationController
          // })
          extensionRouter.use(`/${entity_plural_name}`, authenticationController.controller);
          extensionRouter.use(value.router);
        }
      });
      additional_routes.forEach(routeOptions => {
        const { core_data_name, authentication_function_name, mount_path, } = routeOptions;
        if (mountedAPIRoutes.has(mount_path) === false) {
          const value = periodic.routers.get(core_data_name);
          const authenticationController = getAuthenticationController({ authentication_function_name, });
          // console.log({
          //   mount_path,
          //   value,
          //   authenticationController
          // })
          mountedAPIRoutes.set(mount_path, authenticationController.name);
          extensionRouter.use(`/${mount_path}`, authenticationController.controller, value.router);
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