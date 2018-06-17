'use strict';
const periodic = require('periodicjs');
const mountedAPIRoutes = new Map();

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

function api(options = {}) {
  return new Promise((resolve, reject) => {
    try {
      periodic.routers.forEach((value, key) => { 
        console.log({ key });
      });
      // dbroutes.forEach(dbr => {
      //   const dbrrouter = dataRouters.get(dbr);
      //   periodic.app.use(`${reactapp.manifest_prefix}contentdata`, dbrrouter.router);
      //   loadedRouters.add(dbr);
      // });
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  api,
  mountedAPIRoutes,
  authenticationMap,
};

