'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (app, config) {
  // Insert routes below
  app.use('/auth', require('./auth').default);

  app.route('/login').get(function (req, res) {
    var errorMessage = req.flash('error');

    if (errorMessage.length > 0) {
      var cookieName = 'error-login';
      res.cookie(cookieName, config.I18N.en[config.cookies[cookieName]]);
    }

    res.sendFile(_path2.default.resolve(app.get('appPath') + '/index.html'));
  });

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*').get(_errors2.default[404]);

  // All other routes should redirect to the index.html
  app.route('/*').get(function (req, res) {
    res.sendFile(_path2.default.resolve(app.get('appPath') + '/index.html'));
  });
};

var _errors = require('./components/errors');

var _errors2 = _interopRequireDefault(_errors);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

'use strict'; /**
               * Main application routes
               */
//# sourceMappingURL=routes.js.map