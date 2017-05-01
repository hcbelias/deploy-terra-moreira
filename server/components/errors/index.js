/**
 * Error responses
 */

'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports[404] = function pageNotFound(req, res) {
  var viewFilePath = '404';
  var statusCode = 404;
  var result = {
    status: statusCode
  };

  res.status(result.status);
  res.render(viewFilePath, {}, function (err, html) {
    if (err) {
      return res.status(result.status).json(result);
    }

    res.send(html);
  });
};
//# sourceMappingURL=../../components/errors/index.js.map