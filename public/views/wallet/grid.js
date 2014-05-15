


define(function (require, exports, module) {
  'use strict'

  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');
  var Marionette = require('marionette');
  var WalletDeleteDialog = require('wallet/dialog').WalletDeleteDialog;
  var WalletAddDialog = require('wallet/dialog').WalletAddDialog;
  var WalletEditDialog = require('wallet/dialog').WalletEditDialog;
  var WalletModel = require('wallet/model').WalletModel;


  var showDialog = function (DialogConstructor, model) {
    var dialog = new DialogConstructor();
    dialog.model.set('wallet', model);
    $('.modal-container').append(dialog.render().$el);
    dialog.$el.modal();
    return dialog;
  };

  var WalletItem = exports.WalletItem = Marionette.ItemView.extend({
    template: '#tmpl-_wallet-row',
    tagName: 'tr',
    events: {
      'click .btn.delete' : 'deleteButtonClicked',
      'click .btn.edit' : 'editButtonClicked'
    },

    deleteButtonClicked: (function () {
      var modalContainer = $('.modal-content');

      return function() {
        showDialog(WalletDeleteDialog, this.model);
      };
    }()),

    editButtonClicked: (function () {
      var editDialogContainer = $('.modal-content');

      return function() {
        showDialog(WalletEditDialog, this.model);
      };
    }())
  });

  var WalletGrid = exports.WalletGrid = Marionette.CollectionView.extend({
    itemView: WalletItem,
    tagName: 'table',
    className: 'table table-striped table-bordered table-hover',
    events: {
      'click .btn.add' : 'addButtonClicked'
    },

    _initialEvents: function () {
      var self = this;
      this.on('before:render', (function () {
        var headerTemplate = _.template($('#tmpl-_wallet-table').html());
        return function () {
          self.$el.append(headerTemplate());
        };
      }()));
      this.on('render', (function () {
        var footerTemplate = _.template($('#tmpl-_wallet-add-button').html());
        return function () {
          self.$el.append(footerTemplate());
        };
      }()));
      Marionette.CollectionView.prototype._initialEvents.apply(this, arguments);
    },

    addButtonClicked: (function () {
      var editDialogContainer = $('.modal-content');

      return function () {
        var dialog = showDialog(WalletAddDialog, new WalletModel());
        dialog.collection = this.collection;
      };

    }())

  });

});