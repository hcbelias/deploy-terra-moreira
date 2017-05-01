'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setup = setup;

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _passportGoogleOauth = require('passport-google-oauth20');

var _errors = require('../../components/errors');

var _errors2 = _interopRequireDefault(_errors);

var _environment = require('../../config/environment');

var _environment2 = _interopRequireDefault(_environment);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getDataFromDB(User, username, domain, email, profile, token, done) {
  User.findOne({ 'username': username }).exec().then(function (user) {
    var tokenObject = token ? { 'ssoToken': token } : undefined;
    if (user) {
      return done(null, user, tokenObject);
    }

    user = new User({
      name: profile.displayName,
      email: email,
      username: username,
      provider: 'google',
      google: profile._json
    });

    user.save().then(function (user) {
      return done(null, user, tokenObject);
    }).catch(function (err) {
      return done(err);
    });
  }).catch(function (err) {
    return done(err);
  });
}

function setup(User, config) {
  _passport2.default.use(new _passportGoogleOauth.Strategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL
  }, function (accessToken, refreshToken, profile, done) {
    var email = profile.emails[0].value;
    var fields = email.split('@');
    var username = fields[0];
    var domain = fields[1];
    console.log('Google accessToken: ' + accessToken);
    var endpoint = config.ssoUrl + '?access_token=' + accessToken;

    (0, _request2.default)(endpoint, function (error, response, body) {
      console.log('SSO endpoint: ' + endpoint);
      console.log('SSO response: ' + response.statusCode + ' - ' + response.statusMessage);

      var bodyToken = void 0;

      if (config.domain !== domain) {
        return done(null, false, { message: "error-message-invalid-account" });
      }

      if (error) {
        console.log('SSO Error: ' + error);
      }

      var contentType = response.headers['content-type'];
      console.log('SSO content type: ' + contentType);
      switch (response.statusCode) {
        case 200:
          if (contentType === "text/html; charset=utf-8") {
            bodyToken = { token: endpoint + ' + - 200 HTML' };
            console.log('SSO 200 Status Code returning HTML: ' + response.body);
          } else if (contentType === "application/json; charset=utf-8") {
            bodyToken = JSON.parse(body);
            console.log('SSO accessToken: ' + bodyToken.token);
          } else {
            bodyToken = { token: endpoint + ' + - 200 Unknown' };
            console.log('SSO 200 Status Code returning content not identified: ' + response.body);
          }
          break;
        case 401:
          bodyToken = { token: endpoint + ' + - 401' };
          console.log('SSO Unauthorized.');
          break;
        case 500:
          bodyToken = { token: endpoint + ' + - 500' };
          console.log('SSO Error: ' + body);
          break;
        default:
          bodyToken = { token: endpoint + ' + - None' };
          console.log('SSO Unrecognized Status Code: ' + body);
      }

      return getDataFromDB(User, username, domain, email, profile, bodyToken, done);
    });
  }));
}
//# sourceMappingURL=../../auth/google/passport.js.map