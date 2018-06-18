'use strict';

const periodic = require('periodicjs');
const controllers = require('../controllers');
const __docRouter = periodic.express.Router();

__docRouter.get('/', controllers.indexView);
__docRouter.get('/customize', controllers.customizeView);

module.exports = __docRouter;