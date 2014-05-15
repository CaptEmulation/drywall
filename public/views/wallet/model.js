

define(function (require, exports, module) {
  'use strict';

  var Backbone = require('backbone');

  var WalletModel = exports.WalletModel = Backbone.Model.extend({
    idAttribute: '_id',

    isStartOfRow: function () {
      return this.collection.indexOf(this) % this.collection.width === 0;
    }
  });

  var WalletCollection = exports.WalletCollection = Backbone.Collection.extend({
    width: 4,
    model: WalletModel,
    url: '/sl/wallet/'
  });

});