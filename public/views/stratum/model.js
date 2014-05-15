/**
 * Created by jdean on 3/23/14.
 */


define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var Backbone = require('backbone');

  var ClientModel = Backbone.Model.extend({
    defaults: {
    },
    idAttribute: '_id',
    urlRoot: '/sl/stratum/client',
    getDescription: function () {
      return urlDescriptor(this);
    }
  });

  exports.ClientCollection = Backbone.Collection.extend({
    url: '/sl/stratum/client',
    model: ClientModel
  });

  var urlDescriptor = function (model) {
    var data = _.defaults(model.toJSON(), {
      user: 'user',
      password: 'password',
      host: 'localhost',
      port: -1
    });
    return data.user + ':' + data.password + '@' + data.host + ':' + data.port;
  }

  var ProxyModel = Backbone.Model.extend({
    defaults: {
    },
    idAttribute: '_id',
    urlRoot: '/sl/stratum/proxy',
    getDescription: function () {
      return urlDescriptor(this);
    }
  });

  var ProxyCollection = exports.ProxyCollection = Backbone.Collection.extend({
    url: '/sl/stratum/proxy',
    model: ProxyModel
  });
});