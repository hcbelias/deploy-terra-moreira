'use strict';

angular.module('webapp', ['webapp.constants', 'ngCookies', 'ngResource', 'ngSanitize', 'ui.router', 'validation.match', 'ngMaterial', 'ngMessages', 'ngAnimate']).config(function ($urlRouterProvider, $locationProvider, $mdThemingProvider) {
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);
    $mdThemingProvider.theme('default').primaryPalette('grey').warnPalette('deep-orange').accentPalette('red').dark();
});
//# sourceMappingURL=../app/app.js.map
'use strict';

angular.module('webapp.auth', ['webapp.constants', 'webapp.util', 'ngCookies', 'ui.router']).config(function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
});
//# sourceMappingURL=../../components/auth/auth.module.js.map
'use strict';

angular.module('webapp.util', []);
//# sourceMappingURL=../../components/util/util.module.js.map
"use strict";

(function (angular, undefined) {
	angular.module("webapp.constants", []).constant("appConfig", {
		"userRoles": ["guest", "user", "admin"],
		"I18N": {
			"pt": {}
		}
	});
})(angular);
//# sourceMappingURL=../app/app.constant.js.map
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
  var MainController = function MainController() {
    _classCallCheck(this, MainController);

    this.image = 'assets/img/piece.jpg';
  };

  angular.module('webapp').component('main', {
    templateUrl: 'app/main/main.html',
    controller: MainController
  });
})();
//# sourceMappingURL=../../app/main/main.controller.js.map
'use strict';

angular.module('webapp').config(function ($stateProvider) {
  $stateProvider.state('main', {
    name: 'main',
    url: '/',
    template: '<main layout="column" flex class="home-page"></main>'
  });
});
//# sourceMappingURL=../../app/main/main.js.map
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
  var MessageController = function MessageController() {
    _classCallCheck(this, MessageController);
  };

  angular.module('webapp').component('message', {
    templateUrl: 'app/message/message.html',
    controller: MessageController
  });
})();
//# sourceMappingURL=../../app/message/message.controller.js.map
'use strict';

angular.module('webapp').config(function ($stateProvider) {
  $stateProvider.state('message', {
    name: 'message',
    url: '/message',
    template: '<message layout="column" flex class="home-page"></message>'
  });
});
//# sourceMappingURL=../../app/message/message.js.map
'use strict';

(function () {

  function AuthService($location, $http, $cookies, $q, appConfig, Util, User) {
    var safeCb = Util.safeCb;
    var currentUser = {};
    var userRoles = appConfig.userRoles || [];

    if ($cookies.get('token') && $location.path() !== '/logout') {
      currentUser = User.getMyUser();
    }

    var Auth = {
      logout: function logout() {
        $cookies.remove('token');
        $cookies.remove('ssotoken');
        currentUser = {};
      },


      /**
       * Create a new user
       *
       * @param  {Object}   user     - user info
       * @param  {Function} callback - optional, function(error, user)
       * @returns {Promise}
       */
      createUser: function createUser(user, callback) {
        return User.save(user, function (data) {
          $cookies.put('token', data.token);
          currentUser = User.getMyUser();
          return safeCb(callback)(null, user);
        }, function (err) {
          Auth.logout();
          return safeCb(callback)(err);
        }).$promise;
      },


      /**
       * Gets all available info on a user
       *   (synchronous|asynchronous)
       *
       * @param  {Function|*} callback - optional, funciton(user)
       * @returns {Object|Promise}
       */
      getCurrentUser: function getCurrentUser(callback) {
        if (arguments.length === 0) {
          return currentUser;
        }

        var value = currentUser.hasOwnProperty('$promise') ? currentUser.$promise : currentUser;
        return $q.when(value).then(function (user) {
          safeCb(callback)(user);
          return user;
        }, function () {
          safeCb(callback)({});
          return {};
        });
      },


      /**
       * Check if a user is logged in
       *   (synchronous|asynchronous)
       *
       * @param  {Function|*} callback - optional, function(is)
       * @returns {Bool|Promise}
       */
      isLoggedIn: function isLoggedIn(callback) {
        if (arguments.length === 0) {
          return currentUser.hasOwnProperty('role');
        }

        return Auth.getCurrentUser(null).then(function (user) {
          var is = user.hasOwnProperty('role');
          safeCb(callback)(is);
          return is;
        });
      },
      compareRole: function compareRole(r, h) {
        return userRoles.indexOf(r) >= userRoles.indexOf(h);
      },


      /**
       * Check if a user has a specified role or higher
       *   (synchronous|asynchronous)
       *
       * @param  {String}     role     - the role to check against
       * @param  {Function|*} callback - optional, function(has)
       * @returns {Bool|Promise}
       */
      hasRole: function hasRole(role, callback) {
        if (arguments.length < 2) {
          return Auth.compareRole(currentUser.role, role);
        }

        return Auth.getCurrentUser(null).then(function (user) {
          var has = user.hasOwnProperty('role') ? Auth.compareRole(user.role, role) : false;
          safeCb(callback)(has);
          return has;
        });
      },


      /**
       * Check if a user is an admin
       *   (synchronous|asynchronous)
       *
       * @param  {Function|*} callback - optional, function(is)
       * @return {Bool|Promise}
       */
      isAdmin: function isAdmin() {
        return Auth.hasRole.apply(Auth, [].concat.apply(['admin'], arguments));
      },


      /**
       * Get auth token
       *
       * @returns {String} - a token string used for authenticating
       */
      getToken: function getToken() {
        return $cookies.get('token');
      },
      hasPermissionToEdit: function hasPermissionToEdit(profileUserName, callback) {
        return Auth.getCurrentUser(null).then(function (user) {
          var isAdmin = user.hasOwnProperty('role') ? Auth.compareRole(user.role, 'admin') : false;
          var hasPermission = isAdmin || profileUserName === user.username;
          safeCb(callback)(hasPermission);
          return hasPermission;
        });
      }
    };

    return Auth;
  }

  angular.module('webapp.auth').factory('Auth', AuthService);
})();
//# sourceMappingURL=../../components/auth/auth.service.js.map
'use strict';

(function () {

  function authInterceptor($rootScope, $q, $cookies, $injector, Util) {
    var state;
    return {
      // Add authorization token to headers
      request: function request(config) {
        config.headers = config.headers || {};
        if ($cookies.get('token') && Util.isSameOrigin(config.url)) {
          // Internal Superstars call
          config.headers.Authorization = 'Bearer ' + $cookies.get('token');
        } else if ($cookies.get('ssotoken') && !Util.isSameOrigin(config.url)) {
          // Mulesoft and other endpoints
          config.headers.Authorization = 'Bearer ' + $cookies.get('ssotoken');
        }
        return config;
      },


      // Intercept 401s and redirect you to login
      responseError: function responseError(response) {
        if (response.status === 401) {
          (state || (state = $injector.get('$state'))).go('login');
          // remove any stale tokens
          $cookies.remove('token');
        }
        return $q.reject(response);
      }
    };
  }

  angular.module('webapp.auth').factory('authInterceptor', authInterceptor);
})();
//# sourceMappingURL=../../components/auth/interceptor.service.js.map
'use strict';

(function () {

  angular.module('webapp.auth').run(function ($rootScope, $state, Auth) {});
})();
//# sourceMappingURL=../../components/auth/router.decorator.js.map
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
  var ContactInfoController = function ContactInfoController() {
    _classCallCheck(this, ContactInfoController);
  };

  angular.module('webapp').component('contactInfo', {
    templateUrl: 'components/contact-info/contact-info.html',
    controller: ContactInfoController,
    bindings: {
      icon: '@',
      phone1: '@',
      phone2: '@',
      phone3: '@'
    }
  });
})();
//# sourceMappingURL=../../components/contact-info/contact-info.component.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
  var ContactController = function () {
    function ContactController() {
      _classCallCheck(this, ContactController);
    }

    _createClass(ContactController, [{
      key: 'submitEmail',
      value: function submitEmail() {
        debugger;
      }
    }]);

    return ContactController;
  }();

  angular.module('webapp').component('contact', {
    templateUrl: 'components/contact/contact.html',
    controller: ContactController
  });
})();
//# sourceMappingURL=../../components/contact/contact.component.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
  var FacebookButtonController = function () {
    function FacebookButtonController($window) {
      _classCallCheck(this, FacebookButtonController);

      this.window = $window;
    }

    _createClass(FacebookButtonController, [{
      key: 'openFacebook',
      value: function openFacebook() {
        this.window.open('https://www.facebook.com/advterramoreira/', '_blank');
      }
    }]);

    return FacebookButtonController;
  }();

  angular.module('webapp').component('facebookButton', {
    templateUrl: 'components/facebook-button/facebook-button.html',
    controller: FacebookButtonController
  });
})();
//# sourceMappingURL=../../components/facebook-button/facebook-button.component.js.map
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
  var FooterController = function FooterController($window) {
    _classCallCheck(this, FooterController);

    this.window = $window;
  };

  angular.module('webapp').component('footer', {
    templateUrl: 'components/footer/footer.html',
    controller: FooterController
  });
})();
//# sourceMappingURL=../../components/footer/footer.component.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
  var ToolbarController = function () {
    function ToolbarController($mdSidenav, $state) {
      _classCallCheck(this, ToolbarController);

      this.title = 'Terra Moreira';
      this.toggleLeft = this.buildToggler('left');
      this.toggleRight = this.buildToggler('right');
      this.navbar = this.getNavbar();
      this.state = $state;
      this.image = 'assets/img/cartao.jpg';
    }

    _createClass(ToolbarController, [{
      key: 'getNavbar',
      value: function getNavbar() {
        this.currentNavItem = 'Home';
        return [{
          title: 'Home',
          state: 'main'
        },
        //{
        //  title: 'Áreas de Atuação',
        //  state: 'main'
        //},
        //{
        //  title: 'Área do Cliente',
        //  state: 'main'
        //},
        //{
        //  title: 'Dicionário Jurídico',
        //  state: 'main'
        //},
        {
          title: 'Contato',
          state: 'message'
        }];
      }
    }, {
      key: 'buildToggler',
      value: function buildToggler(componentId) {
        return function () {
          this.mdSidenav(componentId).toggle();
        };
      }
    }, {
      key: 'redirectHomePage',
      value: function redirectHomePage() {
        this.state.go('main');
      }
    }]);

    return ToolbarController;
  }();

  angular.module('webapp').component('toolbar', {
    templateUrl: 'components/toolbar/toolbar.html',
    controller: ToolbarController
  });
})();
//# sourceMappingURL=../../components/toolbar/toolbar.component.js.map
'use strict';

(function () {

  /**
   * The Util service is for thin, globally reusable, utility functions
   */
  function UtilService($window) {
    var Util = {

      /**
       * Return the menu action items
       *
       * @param  {}
       * @return {array of elements}
       */
      getMenuActionItems: function getMenuActionItems(username, loggedUser) {
        return [{
          name: 'Home',
          icon: 'home',
          sref: 'main',
          show: 'all',
          target: ''
        }, {
          name: 'My Profile',
          icon: 'account_circle',
          sref: 'profile({ username: \'' + loggedUser + '\'})',
          show: 'all',
          target: ''
        }, {
          name: 'Public Profile',
          icon: 'public',
          sref: 'publicprofile({ username: ' + username + '})',
          show: 'profile',
          target: '_blank'
        }, {
          name: 'Export Profile',
          icon: 'launch',
          show: 'profile',
          onlyAdmin: true,
          hasOptions: true,
          menuOptions: [{
            icon: '<img src="../../assets/images/docx-icon.svg" height="15" />',
            label: 'Export to DOCX',
            link: 'exportprofile({ username: ' + username + ', to: \'doc\'})'
          }, {
            icon: '<i class="material-icons">insert_drive_file</i>',
            label: 'Export to PDF',
            link: 'exportprofile({ username: ' + username + ', to: \'pdf\'})'
          }]
        }];
      },


      /**
       * Return a callback or noop function
       *
       * @param  {Function|*} cb - a 'potential' function
       * @return {Function}
       */
      safeCb: function safeCb(cb) {
        return angular.isFunction(cb) ? cb : angular.noop;
      },


      /**
       * Parse a given url with the use of an anchor element
       *
       * @param  {String} url - the url to parse
       * @return {Object}     - the parsed url, anchor element
       */
      urlParse: function urlParse(url) {
        var a = document.createElement('a');
        a.href = url;

        // Special treatment for IE, see http://stackoverflow.com/a/13405933 for details
        if (a.host === '') {
          a.href = a.href;
        }

        return a;
      },


      /**
       * Test whether or not a given url is same origin
       *
       * @param  {String}           url       - url to test
       * @param  {String|String[]}  [origins] - additional origins to test against
       * @return {Boolean}                    - true if url is same origin
       */
      isSameOrigin: function isSameOrigin(url, origins) {
        url = Util.urlParse(url);
        origins = origins && [].concat(origins) || [];
        origins = origins.map(Util.urlParse);
        origins.push($window.location);
        origins = origins.filter(function (o) {
          var hostnameCheck = url.hostname === o.hostname;
          var protocolCheck = url.protocol === o.protocol;
          // 2nd part of the special treatment for IE fix (see above): 
          // This part is when using well-known ports 80 or 443 with IE,
          // when $window.location.port==='' instead of the real port number.
          // Probably the same cause as this IE bug: https://goo.gl/J9hRta
          var portCheck = url.port === o.port || o.port === '' && (url.port === '80' || url.port === '443');
          return hostnameCheck && protocolCheck && portCheck;
        });
        return origins.length >= 1;
      }
    };

    return Util;
  }

  angular.module('webapp.util').factory('Util', UtilService);
})();
//# sourceMappingURL=../../components/util/util.service.js.map
angular.module("webapp").run(["$templateCache", function($templateCache) {$templateCache.put("app/main/main.html","<md-content><div class=\"image-background md-whiteframe-18dp\"><img ng-src=\"{{$ctrl.image}}\" alt=\"Advocacia Terra Moreira\" class=\"md-card-image img-responsive content md-whiteframe-20d\"/></div><md-toolbar class=\"content-divider\"><md-toolbar-tools></md-toolbar-tools></md-toolbar><div class=\"card-section md-whiteframe-16dp\"><md-card class=\"content card md-whiteframe-20dp content-card\"><md-toolbar><md-toolbar-tools><span class=\"md-headline\">Quem Somos</span></md-toolbar-tools></md-toolbar><div layout=\"row\" class=\"degrade\"></div><md-card-content><p class=\"md-body-1\">O escritório Terra Moreira Sociedade de Advogados está inscrito na OAB/MG sob o número 5.536, sendo um escritório completo que oferece apoio profissional experiente para indivíduos e empresas. Somos um escritório consolidado no mercado da advocacia, com atuação em diversas áreas do Direito.</p><p class=\"md-body-1\">O diferencial do escritório é a sua atuação personalizada e estreita relação com o cliente, oferecendo soluções rápidas, seguras e eficazes para os questionamentos apresentados, pautando-se na ética profissional e absoluto sigilo nas negociações, sempre visando o melhor interesse do cliente. </p></md-card-content></md-card><md-card class=\"content card md-whiteframe-20dp content-card\"><md-toolbar><md-toolbar-tools><span class=\"md-headline\">Valores e Missão</span></md-toolbar-tools></md-toolbar><div layout=\"row\" class=\"degrade\"></div><md-card-content><p class=\"md-body-1\">Procuramos construir uma banca de advocacia sólida, respeitada, moderna, eficiente e dinâmica, pautada em princípios de profissionalismo, lealdade, parceria, modernidade e pioneirismo.</p><p class=\"md-body-1\">Nosso maior foco é alcançar os resultados almejados por nossos clientes, sendo que o fruto de nosso sucesso deve-se ao planejamento, profissionais qualificados, trabalho árduo, entusiasmo e dedicação à causa.</p><p class=\"md-body-1\">Agradecemos imensamente a todos os clientes, amigos, parceiros e funcionários que de alguma forma nos ajudam a implementar nossos projetos.</p></md-card-content></md-card><md-card class=\"content card md-whiteframe-20dp content-card\"><md-toolbar><md-toolbar-tools><span class=\"md-headline\">Onde Estamos</span></md-toolbar-tools></md-toolbar><div layout=\"row\" class=\"degrade\"></div><md-card-content><p class=\"md-body-1\">Nosso escritório está localizado na rua Tenente de Brito Melo, 404, bairro Barro Preto, em Belo Horizonte-MG.</p><iframe src=\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3751.0765208413886!2d-43.956666084579716!3d-19.92117998660866!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xa697436622eefd%3A0x8ad2377d21b0ef84!2sAdvocacia+Terra+Moreira!5e0!3m2!1sen!2sus!4v1496805646780\" width=\"600\" height=\"450\" frameborder=\"0\" style=\"border:0\" allowfullscreen=\"\"></iframe></md-card-content></md-card></div><md-toolbar class=\"content-divider\"><md-toolbar-tools></md-toolbar-tools></md-toolbar><contact class=\"contact\"></contact><md-toolbar class=\"content-divider\"><md-toolbar-tools></md-toolbar-tools></md-toolbar></md-content>");
$templateCache.put("app/message/message.html","<contact class=\"message-container\"></contact>");
$templateCache.put("components/contact/contact.html","<md-card class=\"content card md-whiteframe-20dp contact-card content-card\"><md-toolbar><md-toolbar-tools><span class=\"md-headline\">Fale Conosco</span></md-toolbar-tools></md-toolbar><div layout=\"row\" class=\"degrade\"></div><md-card-content layout-align=\"center center\" layout=\"row\"><form name=\"contactForm\" layout=\"column\" layout-align=\"start start\" ng-submit=\"$ctrl.sendEmail()\"><div layout=\"column\" layout-gt-sm=\"row\"><md-input-container><label for=\"clientName\">Nome</label><input ng-model=\"$ctrl.name\" required=\"required\" name=\"clientName\" md-no-asterisk=\"md-no-asterisk\"/><div ng-messages=\"contactForm.clientName.$error\"><div ng-message=\"required\">Preenchimento obrigatório</div></div></md-input-container><md-input-container><label>Telefone</label><input ng-model=\"$ctrl.phone\" type=\"phone\" name=\"clientPhone\" required=\"required\" md-no-asterisk=\"md-no-asterisk\"/><div ng-messages=\"contactForm.clientPhone.$error\"><div ng-message=\"required\">Preenchimento obrigatório</div></div></md-input-container><md-input-container><label>E-mail</label><input ng-model=\"$ctrl.email\" type=\"email\" name=\"clientEmail\"/><div ng-messages=\"contactForm.clientEmail.$error\"><div ng-message=\"pattern\">Preenchimento obrigatório</div></div></md-input-container><md-input-container><label>Descrição</label><textarea ng-model=\"$ctrl.description\" name=\"clientDescription\" md-maxlength=\"250\" maxlength=\"250\" minlength=\"5\" md-minlength=\"5\" required=\"required\" md-no-asterisk=\"md-no-asterisk\" md-select-on-focus=\"md-select-on-focus\"></textarea><div ng-messages=\"contactForm.clientDescription.$error\"><div ng-message=\"required\">Preenchimento obrigatório</div><div ng-message=\"minlength\">Por favor, escreva uma pequena descrição</div></div></md-input-container><md-input-container><md-button type=\"submit\" ng-disabled=\"contactForm.$invalid\" class=\"send-button\">Enviar</md-button></md-input-container></div></form></md-card-content><div layout=\"row\" class=\"degrade\"></div><facebook-button flex=\"flex\"></facebook-button></md-card>");
$templateCache.put("components/contact-info/contact-info.html","<div layout-padding=\"layout-padding\" layout=\"row\" layout-align=\"center center\" class=\"contact-info\"><div class=\"contact-info-icon\"><md-button aria-label=\"Nos visite no Facebook\" class=\"md-fab contact-icon\"><md-icon class=\"material-icons contact-info-icon-text\">{{ $ctrl.icon }}</md-icon></md-button></div><div flex=\"80\" class=\"contact-info-phone-text\"><div layout=\"row\"> <span class=\"prefix\">(31) </span><span class=\"phone\">{{ $ctrl.phone1 }}</span></div><div layout=\"row\"> <span class=\"prefix\">(31) </span><span class=\"phone\">{{ $ctrl.phone2 }}</span></div><div layout=\"row\"> <span class=\"prefix\">(31) </span><span class=\"phone\">{{ $ctrl.phone3 }}</span></div></div></div>");
$templateCache.put("components/facebook-button/facebook-button.html","<div layout-padding=\"layout-padding\" layout-margin=\"layout-margin\" layout-align=\"center center\" ng-click=\"$ctrl.openFacebook()\" layout=\"column\" layout-gt-xs=\"row\"><md-button aria-label=\"Nos visite no Facebook\" class=\"md-fab\"><img ng-src=\"/assets/img/facebook-white.png\" alt=\"Advocacia Terra Moreira\"/></md-button><span>Acesse nossa página no Facebook</span></div>");
$templateCache.put("components/footer/footer.html","<div layout=\"column\" layout-gt-sm=\"row\" class=\"content\"><div layout=\"column\" layout-gt-xs=\"row\" flex=\"50\" layout-align=\"center center\"><contact-info icon=\"phone\" phone1=\"2523-8533\" phone2=\"3018-6128\" phone3=\"3515-5099\"></contact-info><contact-info icon=\"smartphone\" phone1=\"98563-2664\" phone2=\"99376-3195\" phone3=\"98104-7997\"></contact-info></div><div layout-align=\"center center\" layout=\"column\" flex=\"50\"><span class=\"footer-text md-title\">Rua Tenente Brito de Melo, 404</span><span class=\"footer-text md-title\">Barro Preto - Belo Horizonte/MG</span><span class=\"footer-text md-title\">CEP: 30180-072</span></div></div>");
$templateCache.put("components/toolbar/toolbar.html","<md-toolbar md-scroll-shrink=\"\" class=\"md-toolbar md-whiteframe-12dp\"><div layout=\"row\" layout-align=\"space-between center\" class=\"md-toolbar-tools content\"><img ng-src=\"{{$ctrl.image}}\" alt=\"Advocacia Terra Moreira\" ng-click=\"$ctrl.redirectHomePage()\" class=\"md-card-image\"/><md-nav-bar flex=\"\" md-selected-nav-item=\"$ctrl.currentNavItem\" nav-bar-aria-label=\"navigation links\" hide=\"hide\" show-gt-sm=\"\"><md-nav-item ng-repeat=\"item in $ctrl.navbar\" md-nav-sref=\"{{item.state}}\" name=\"{{item.title}}\">{{item.title}}</md-nav-item></md-nav-bar><div hide-gt-sm=\"\" layout=\"row\" flex=\"\" layout-align=\"space-between center\"><span flex=\"flex\" class=\"mobile-title\">ADVOCACIA TERRA MOREIRA</span><md-button><i class=\"inset material-icons\">menu     </i></md-button></div></div><div layout=\"row\" class=\"degrade\"></div></md-toolbar>");}]);