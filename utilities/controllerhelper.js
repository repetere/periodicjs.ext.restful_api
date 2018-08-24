
const periodic = require('periodicjs');
const vm = require('vm');
const str2json = require('string-to-json');
const flatten = require('flat');
const fs = require('fs-extra');
const mongoose = require('mongoose');
let encryption_key;
let utilities;

function approveOptionsRequest(req, res, next){
  if (req.method && typeof req.method === 'string' && req.method.toUpperCase() === 'OPTIONS') {
    res.send('ok pre-flight');
    // res.sendStatus(200);
  } else {
    next();
  }
}

async function fullDocumentUpdate(req) {
  if (!utilities) {
    utilities = periodic.locals.extensions.get('periodicjs.ext.restful_api');
  }
  if (req.body && req.body.title && !req.body.name) {
    req.body.name = periodic.core.utilities.makeNiceName(req.body.title);
  }
  if (req.query.full_update || (req.body && req.body.full_update) || (req.controllerData && req.controllerData.full_update)) { 
    const { coredataAPIRoutes, } = utilities.init;
    const urlParts = req.baseUrl.split('/');
    const coreDataPart = urlParts[ urlParts.length - 1 ]||req.body.core_data_name;
    const coredata = coredataAPIRoutes.get(coreDataPart);
    if (coredata) {
      const dbdoc = await periodic.datas.get(coredata).load({ query: utilities.controllerhelper.getIdQuery(req.query.docid || req.query._id || req.body.docid || req.body._id || req.params.id), });
      const doc = dbdoc.toJSON ? dbdoc.toJSON() : dbdoc;
      req.body = Object.assign({}, doc, req.body);
    }
  }
  return req;
}

function fixCodeMirrorSubmit(req = {}){
  req.controllerData = req.controllerData || {};
  if (req.body && req.body.genericdocjson) {
    const sandbox = { jsonbody: {}, };
    req.controllerData.skip_xss = true;
    req.controllerData.encryptFields = true;
    
    vm.createContext(sandbox);
    vm.runInContext(`jsonbody = ${req.body.genericdocjson}`, sandbox);
    const jsonbody = sandbox.jsonbody;
    delete req.body.genericdocjson;
    req.body = Object.assign({}, req.body, jsonbody);
    if (!req.body.docid && req.body._id) {
      req.body.docid = req.body._id;
    }
    // delete req.body._id;
    delete req.body.__v;
    // delete req.body.format;
    Object.keys(req.body).forEach(function(key) {
      if (req.body[key] === '!!--EMPTY--single--EMTPY--!!') {
        req.body[key] = null;
      } else if (req.body[key] === '!!--EMPTY--array--EMTPY--!!') {
        req.body[key] = [];
      }
    });
  }
  if (!req.controllerData.denyHTMLxss) {
    req.controllerData = Object.assign({}, req.controllerData, { html_xss: true, });
  }
  return req;
}

function fixFlattenedSubmit(req) {
  if (req.query.rawrequest) return req;
  let hasFlattenedSubmit = false;
  Object.keys(req.body).forEach(formname => {
    if (req.body[ formname ] === 'undefined') req.body[ formname ] = undefined;
    if (formname.indexOf('.') !== -1) hasFlattenedSubmit = true;
  });
  if (hasFlattenedSubmit) {
    // req.body = str2json.convert(req.body);
    console.log('BEFORE req.body', req.body);
    req.body = flatten.unflatten(req.body);
    if (!req.body.docid && req.body._id) {
      req.body.docid = req.body._id;
    }
    
    delete req.body._csrf;
    delete req.body.__v;
  }
  return req;
}

function decryptAsset(req, res, next) {
  if (!encryption_key) {
    const extsettings = periodic.settings.extensions[ 'periodicjs.ext.restful_api' ];
    encryption_key = fs.readFileSync(extsettings.encryption_key_path).toString();
  }
  return periodic.core.files.decryptAssetMiddlewareHandler({
    periodic,
    encryption_key,
  })(req, res, next);
}

function handleFileUpload(req, res, next) {
  if (!encryption_key) {
    const extsettings = periodic.settings.extensions[ 'periodicjs.ext.restful_api' ];
    encryption_key = fs.readFileSync(extsettings.encryption_key_path).toString();
  }
  if (req.query.forcequerytobody) { //this is because multer rename function is being called before multipart form body is parsed
    req.query.encryptfiles = (req.query.encryptfiles) ? true : undefined;
    req.body = Object.assign({}, req.body, req.query);
    req.controllerData = Object.assign({}, req.controllerData, req.query);
  }
  if (req.headers && req.headers[ 'content-type' ] && req.headers[ 'content-type' ].indexOf('multipart/form-data') !== -1) {
    if (req.query.encryptfiles) {
      return periodic.core.files.uploadMiddlewareHandler({
        periodic,
        encrypted_client_side: true,
        encryption_key,
        save_file_to_asset: (typeof req.save_file_to_asset==='boolean')? req.save_file_to_asset: true,
        send_response: (typeof req.send_response ==='boolean') ? req.send_response : false,
      })(req, res, next);
    } else {
      return periodic.core.files.uploadMiddlewareHandler({
        periodic,
        save_file_to_asset: (typeof req.save_file_to_asset==='boolean')? req.save_file_to_asset: true,
        send_response: (typeof req.send_response ==='boolean') ? req.send_response : false,
      })(req, res, next);
    }
    // return assetController.multiupload(req, res, next);
  } else {
    next();
  }
}

const handleFileAssetsResponse = function(req, res, next) {
  if (req.query.handleupload || req.controllerData.handleupload || req.body.handleupload) {
    // req.query.format = 'json';
    return handleControllerDataResponse(req, res);
  } else {
    next();
  }
};

const handleControllerDataResponse = function(req, res) {
  //console.log('req.controllerData',req.controllerData);
  delete req.controllerData.authorization_header;
  res.send((req.controllerData.useSuccessWrapper) ? {
    result: 'success',
    data: req.controllerData,
  } : req.controllerData);
};

function getIdQuery(id) {
  const objectIdTest = new RegExp(/[a-f0-9]{24}/i);
  return (mongoose.Types.ObjectId.isValid(id) && objectIdTest.test(id))
    ? {
      _id: id,
    }
    : {
      name: id,
    };
}

module.exports = {
  approveOptionsRequest,
  fullDocumentUpdate,
  fixCodeMirrorSubmit,
  fixFlattenedSubmit,
  decryptAsset,
  handleFileUpload,
  handleFileAssetsResponse,
  handleControllerDataResponse,
  getIdQuery,
};