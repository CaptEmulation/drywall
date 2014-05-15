

window.app = window.app || {};

(function () {

  var initialize = function () {
    setTimeout(function () {
      if (window.app && typeof window.app.main === 'string') {
        require.config({
          baseUrl: window.app.baseUrl,
          // 3rd party script alias names (Easier to type "jquery" than "libs/jquery, etc")
          // probably a good idea to keep version numbers in the file names for updates checking
          paths:{
            // Core Libraries
            "jquery":"vendor/jquery/jquery",
            "underscore":"vendor/underscore/underscore",
            "backbone":"vendor/backbone/backbone",
            "marionette":"vendor/plugins/backbone.marionette",
            "socket.io": "vendor/socket.io/dist/socket.io",

            // Plugins
            "backbone.validateAll":"vendor/plugins/Backbone.validateAll",
            "bootstrap":"vendor/plugins/bootstrap",
            "text":"vendor/plugins/text",
            "grid":"views/grid",
            "d3": "vendor/d3/d3",
            "nvd3": "vendor/nvd3/nv.d3",

            // App framework
            'wallet': window.app.baseUrl + 'views/wallet',
            'chart': window.app.baseUrl + 'views/chart',
            'stratum': window.app.baseUrl + 'views/stratum'
          },
          // Sets the configuration for your third party scripts that are not AMD compatible
          shim:{
            // Twitter Bootstrap jQuery plugins
            "bootstrap":["jquery"],
            // jQueryUI
            "jqueryui":["jquery"],
            // Backbone
            "backbone":{
              // Depends on underscore/lodash and jQuery
              "deps":["underscore", "jquery"],
              // Exports the global window.Backbone object
              "exports":"Backbone"
            },
            'socket.io': {
              exports: 'io'
            },
            // NV.D3 (charts)
            "nvd3": {
              "deps": ["d3"],
              "exports": "nv"
            },
            //Marionette
            "marionette":{
              "deps":["underscore", "backbone", "jquery"],
              "exports":"Marionette"
            },
            "underscore": {
              "exports": '_'
            },
            // Backbone.validateAll plugin that depends on Backbone
            "backbone.validateAll":["backbone"]
          }
        });

        require([window.app.main], function () {

        });
      } else {
        initialize();
      }
    }, 150);
  };
  initialize();
}());
