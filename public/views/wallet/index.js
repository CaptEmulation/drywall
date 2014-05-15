

require.config({
  paths:{
    'wallet': window.app.baseUrl + 'views/wallet'
  }
});

define(function (require, exports, module) {
  'use strict';

  require('bootstrap');
  require('backbone.validateAll');
  var $ = require('jquery');

  var WalletCollection = require('models/wallet').WalletCollection;
  var WalletGrid = require('wallet/grid').WalletGrid;

  var walletCollection = new WalletCollection();
  walletCollection.fetch().then(function () {

    var walletGrid = new WalletGrid({
      collection: walletCollection
    });

    walletGrid.render();
    $('div.wallet-table').html(walletGrid.el);
  });

});