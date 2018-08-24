'use strict';
const periodic = require('periodicjs');
let utilities;

async function fullDocumentUpdate(req) {
  if (!utilities) {
    utilities = periodic.locals.extensions.get('periodicjs.ext.restful_api');
  }
  if (req.query.full_update || (req.body && req.body.full_update) || (req.controllerData && req.controllerData.full_update)) { 
    const { mountedAPIRoutes, coredataAPIRoutes, } = utilities.init;
    const urlParts = req.baseUrl.split('/');
    const coreDataPart = urlParts[ urlParts.length - 1 ];
    const coredata = coredataAPIRoutes.get(coreDataPart);
    if (coredata) {
      const doc = await periodic.datas.get(coredata).load({ query: utilities.controllerhelper.getIdQuery(req.params.id), });
      console.log({ doc });
    }
  }

  return req;
}

module.exports = {
  pre: {
    GET: {
      // '/some/route/path/:id':[testPreTransform]
    },
    PUT: {
      // '/api/*':[fullDocumentUpdate]
    }
  },
  post: {
    GET: {
      // '/another/route/test/:id':[testPostTransform]
    },
    PUT: {
    }
  }
}