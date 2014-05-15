


define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var _ = require('underscore');
  var Marionette = require('marionette');
  var strings = require('wallet/strings');

  function formData($el) {
    var form = $el.find('form');
    var data = {
      fullName: form.find('input#coin-name').val(),
      shortName: form.find('input#coin-short-name').val(),
      host: form.find('input#coin-host').val(),
      port: form.find('input#coin-port').val(),
      rpcUser: form.find('input#coin-rpc-user').val(),
      rpcPassword: form.find('input#coin-rpc-password').val()
    };
    return data;
  }


  var WalletCrudDialog = Marionette.View.extend({
    template: _.template($('#tmpl-_wallet-crud-modal').html()),
    tagName: 'modal',

    initialize: function() {
      this.listenTo(this.model, "change:wallet", this.renderContent);
    },

    renderContent: function () {
      this.model.set('content', this.content({obj:this.model.get('wallet').toJSON()}));
    },

    render: function () {
      this.$el = $(this.template({obj:this.model.toJSON()}));
      if (typeof this.onConfirmButtonClicked === 'function') {
        this.$el.find('.btn.submit').click(this.onConfirmButtonClicked.bind(this));
      }
      if (typeof this.onCancelButtonClicked === 'function') {
        this.$el.find('.btn.cancel').click(this.onCancelButtonClicked.bind(this));
      }
      return this;
    },

    close: function () {
      this.$el.modal('hide');
      Marionette.View.prototype.close.apply(this, arguments);
    }

  });

  var WalletDeleteDialog = exports.WalletDeleteDialog = WalletCrudDialog.extend({
    content: _.template($('#tmpl-_wallet-delete-content').html()),

    initialize: function () {
      this.model = new Backbone.Model({
        title: strings.DELETE_MODAL_TITLE,
        submitButtonName: 'Delete',
        cancelButtonName: 'Cancel'
      });
      this.listenTo(this.model, 'change:wallet', function () {
        this.wallet = this.model.get('wallet');
        this.listenTo(this.wallet, 'destroy', this.close, this);
      }.bind(this));
      WalletCrudDialog.prototype.initialize.apply(this, arguments);
    },

    onConfirmButtonClicked: function () {
      if (this.wallet) {
        this.wallet.destroy();
      }
    }
  });

  var WalletAddDialog = exports.WalletAddDialog = WalletCrudDialog.extend({
    content: _.template($('#tmpl-_wallet-edit-form').html()),

    initialize: function () {
      this.model = new Backbone.Model({
        title: strings.ADD_MODAL_TITLE,
        submitButtonName: 'Add',
        cancelButtonName: 'Cancel'
      });
      this.listenTo(this.model, 'change:wallet', function () {
        this.wallet = this.model.get('wallet');
        this.listenTo(this.wallet, 'destroy', this.close, this);
      }.bind(this));
      WalletCrudDialog.prototype.initialize.apply(this, arguments);
    },

    onConfirmButtonClicked: function () {
      this.wallet.set(formData(this.$el));
      this.collection.add(this.wallet);
      this.wallet.save().then(this.close.bind(this));
    }
  });

  var WalletEditDialog = exports.WalletEditDialog = WalletCrudDialog.extend({
    content: _.template($('#tmpl-_wallet-edit-form').html()),

    initialize: function () {
      this.model = new Backbone.Model({
        title: strings.ADD_MODAL_TITLE,
        submitButtonName: 'Edit',
        cancelButtonName: 'Cancel'
      });
      this.listenTo(this.model, 'change:wallet', function () {
        this.wallet = this.model.get('wallet');
        this.listenTo(this.wallet, 'destroy', this.close, this);
      });
      WalletCrudDialog.prototype.initialize.apply(this, arguments);
    },

    onConfirmButtonClicked: function () {
      this.wallet.set(formData(this.$el));
      this.wallet.save().then(this.close.bind(this));
    }

  });

})