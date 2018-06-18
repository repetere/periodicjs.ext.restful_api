'use strict';
const periodic = require('periodicjs');
// const utilities = require('../utilities');

function apiMiddleware(req, res, next) {
  const asyncExtensionRouter = periodic.locals.extensions.get('periodicjs.ext.restful_api').init.extensionRouter;
  req.query = Object.assign({ format: 'json', }, req.query);
  return asyncExtensionRouter(req, res, next);
}

module.exports = {
  apiMiddleware,
};