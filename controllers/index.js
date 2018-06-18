'use strict';
const periodic = require('periodicjs');
const restfulAPISettings = periodic.settings.extensions[ 'periodicjs.ext.restful_api' ];
const rjx = require('rjx');
const rebulma = require('re-bulma');
const reactHighlight = require('react-highlight');
// console.log({reactHighlight})
const renderRJX = rjx.rjxHTMLString.bind({
  debug: true,
  reactComponents: Object.assign({}, rebulma, { Highlight:reactHighlight.default, }),
});

function apiMiddleware(req, res, next) {
  const asyncExtensionRouter = periodic.locals.extensions.get('periodicjs.ext.restful_api').init.extensionRouter;
  req.query = Object.assign({ format: 'json', }, req.query);
  return asyncExtensionRouter(req, res, next);
}

function requireAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.session.return_url = `/${restfulAPISettings.route_path}/v${restfulAPISettings.version}/__doc`;
    res.redirect(req.query.login||'/login');
  }
}

function indexView(req, res) {
  const indexTemplate = require('../views/__doc/index.rjx');
  const viewdata = Object.assign({
    passportUser: req.user,
  },
  res.locals,
  req.controllerData);
  const viewtemplate = indexTemplate.getTemplate();
  const rjxString = renderRJX({
    rjx: viewtemplate,
    resources: viewdata,
  });
  res.send(rjxString);
}

function customizeView(req, res) {
  const customizeTemplate = require('../views/__doc/customize.rjx');
  const viewdata = Object.assign({
    passportUser: req.user,
  },
  res.locals,
  req.controllerData);
  const viewtemplate = customizeTemplate.getTemplate();
  const rjxString = renderRJX({
    rjx: viewtemplate,
    resources: viewdata,
  });
  res.send(rjxString);
}

module.exports = {
  apiMiddleware,
  requireAuthentication,
  indexView,
  customizeView,
};