'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isAuthenticated = isAuthenticated;
exports.hasRole = hasRole;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;
exports.hasPermissionToEdit = hasPermissionToEdit;
exports.hasPermissionToAddEntity = hasPermissionToAddEntity;

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _environment = require('../config/environment');

var _environment2 = _interopRequireDefault(_environment);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _expressJwt = require('express-jwt');

var _expressJwt2 = _interopRequireDefault(_expressJwt);

var _composableMiddleware = require('composable-middleware');

var _composableMiddleware2 = _interopRequireDefault(_composableMiddleware);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var validateJwt = (0, _expressJwt2.default)({
  secret: _environment2.default.secrets.session
});

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {
  return (0, _composableMiddleware2.default)()
  // Validate jwt
  .use(function (req, res, next) {
    // allow access_token to be passed through query parameter as well
    if (req.query && req.query.hasOwnProperty('access_token')) {
      req.headers.authorization = 'Bearer ' + req.query.access_token;
    }
    validateJwt(req, res, next);
  });
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
  if (!roleRequired) {
    throw new Error('Required role needs to be set');
  }

  return (0, _composableMiddleware2.default)().use(isAuthenticated()).use(function meetsRequirements(req, res, next) {
    if (_environment2.default.userRoles.indexOf(req.user.role) >= _environment2.default.userRoles.indexOf(roleRequired)) {
      next();
    } else {
      res.status(403).send('Forbidden');
    }
  });
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id, role) {
  return _jsonwebtoken2.default.sign({
    _id: id,
    role: role
  }, _environment2.default.secrets.session, {
    expiresIn: 60 * 60 * 5
  });
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  if (!req.user) {
    return res.status(404).send('It looks like you aren\'t logged in, please try again.');
  }
  res.cookie('token', signToken(req.user._id, req.user.role));
  res.redirect('/');
}

function hasPermissionToEdit(req, res) {
  return (0, _composableMiddleware2.default)().use(isAuthenticated()).use(function hasPermission(req, res, next) {
    var userData = req.user;
    if (userData.username === req.user.username || req.user.role === 'admin') {
      next();
    } else {
      res.status(403).send({
        message: 'This user does not have permission to edit.'
      });
    }
  });
}

function hasPermissionToAddEntity(req, res) {
  return (0, _composableMiddleware2.default)().use(isAuthenticated()).use(function hasPermission(req, res, next) {
    if (req.user.role === 'admin') {
      next();
    } else {
      res.status(403).send({
        message: 'This user does not have permission to edit.'
      });
    }
  });
}
//# sourceMappingURL=../auth/auth.service.js.map