'use strict';

const periodic = require('periodicjs');
const utilities = require('../utilities');
const asyncExtensionRouter = utilities.init.extensionRouter;
const controllers = require('../controllers');
// const extensionRouter = periodic.express.Router();
const restfulAPISettings = periodic.settings.extensions['periodicjs.ext.restful_api'];

periodic.app.use(`/${restfulAPISettings.route_path}/v${restfulAPISettings.version}`, controllers.apiMiddleware);

module.exports = asyncExtensionRouter;