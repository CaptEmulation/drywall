/**
 * Created by jdean on 3/10/14.
 */



define(function (require, exports, module) {
  'use strict';

  require('bootstrap');
  require('marionette');
  require('backbone.validateAll');
  var $ = require('jquery');
  var _ = require('underscore');
  var rpc = require('wallet/stat/rpc');

  var walletId = window.app.data.walletId;

  var rpcToStat = {
    'balance': 'getbalance'
  }

  var WalletStatTableItem = Backbone.Marionette.ItemView.extend({
    template: '#tmpl-_wallet-stat-item'
  });

  var WalletStatTable = Backbone.Marionette.CollectionView.extend({
    itemView: WalletStatTableItem
  });

  var statModel = rpc.walletConnect(walletId).statModel();

  statModel.fetch().then((function () {



    return function () {
      var statCollection = new Backbone.Collection();


      Object.keys(statModel.toJSON()).forEach(function (key) {
        var value = statModel.get(key);
        if (value.toString().indexOf('[object Object]') !== -1) {
          Object.keys(value).forEach(function (key) {
            statCollection.add({
              label: key,
              value: value[key]
            });
          });
        } else {
          statCollection.add({
            label: key,
            value: statModel.get(key)
          });
        }
      });


      var table = new WalletStatTable({
        collection: statCollection
      });

      $('.stat-content').html(table.render().$el);
    }
  }()));
});