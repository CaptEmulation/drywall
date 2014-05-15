

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  require('bootstrap');
  require('backbone.validateAll');
  var Backbone = require('backbone');
  var Marionette = require('marionette');
  var GridView = require('grid/GridView');
  var GridCollection = require('grid/GridCollection');
  var CellCollection = require('grid/CellCollection');
  var GridModel = require('grid/GridModel');
  var RowView = require('grid/RowView');



  var CoinModel = exports.CoinModel = Backbone.Model.extend({
    idAttribute: '_id',

    isStartOfRow: function () {
      return this.collection.indexOf(this) % this.collection.width === 0;
    }
  });

  var CoinCellCollection = CellCollection.extend({
    model: CoinModel
  });

  var WalletCollection = exports.WalletCollection = Backbone.Collection.extend({
    width: 4,
    model: CoinModel,
    url: '/sl/wallet/'
  });

  var CoinItem = Marionette.ItemView.extend({
    template: '#tmpl-_coin-balance-cell',
    className: 'cell well stat col-lg-2',
    onRender: function () {
      this.$el.draggable = true;
    }
  });

  var GridRowView = RowView.extend({
    itemView: CoinItem
  });

  var CoinGridView = GridView.extend({
    itemView: GridRowView
  });

  var walletCollection = new WalletCollection();
  walletCollection.fetch().then(function () {
    var cellCollection = new CoinCellCollection();

    function applyWalletToCell(wallet) {
      cellCollection.add(wallet);
    }

    var gridCollection = new GridCollection();
    var gridModel = new GridModel({
      width: 2,
      gridCollection: gridCollection,
      cellCollection: cellCollection,
    });
    walletCollection.forEach(applyWalletToCell);

    var gridView = new CoinGridView({
      collection: gridCollection
    });
    gridView.$el.addClass('col-lg-6')
    $('div.coin-balances').html(gridView.render().el);

  });





});