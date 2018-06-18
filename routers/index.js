'use strict';

const periodic = require('periodicjs');
// const asyncExtensionRouter = utilities.init.extensionRouter;
const extensionRouter = periodic.express.Router();
const __docRouter = require('./__doc');
const controllers = require('../controllers');
const restfulAPISettings = periodic.settings.extensions[ 'periodicjs.ext.restful_api' ];

extensionRouter.use(`/${restfulAPISettings.route_path}/v${restfulAPISettings.version}/__doc`, controllers.requireAuthentication, __docRouter);
extensionRouter.use(`/${restfulAPISettings.route_path}/v${restfulAPISettings.version}`, controllers.apiMiddleware);

module.exports = extensionRouter;