/**
 * Created by jdean on 3/23/14.
 */

define(function (require, exports, module) {
  'use strict';

  var Marionette = require('marionette');
  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');
  var confirmDangerousAction = require('stratum/utils').confirmDangerousAction;

  var Row = Marionette.ItemView.extend({
    template: '#tmpl-_stratum-client-row',
    className: 'row',
    events: {
      'click .btn.stratum-client-edit': 'onEdit',
      'click .btn.stratum-client-delete': 'onDelete'
    },

    onEdit: function () {
      var form = new FormView({
        model: this.model
      });
      this.$el.empty();
      this.$el.append(form.render().$el);
      form.once('save cancel', function () {
        this.render();
      }.bind(this));
    },

    onDelete: function () {
      if (!this.actionConfirmer) {
        this.actionConfirmer = confirmDangerousAction(this.$el.find('.btn.stratum-client-delete'), function () {
          this.model.destroy();
        }.bind(this));
      }
      this.actionConfirmer();
    }
  });

  var CollectionView = Marionette.CollectionView.extend({
    itemView: Row,
    className: 'col-lg-12'
  });

  var FormView = Marionette.ItemView.extend({
    template: '#tmpl-_stratum-client-row-form',
    className: 'row',
    events: {
      'click .btn.stratum-client-cancel': 'onCancel',
      'click .btn.stratum-client-save': 'onSave'
    },

    onCancel: function () {
      this.trigger('cancel');
    },

    onSave: function () {
      this.model.save({
        host: this.$el.find('input#stratum-client-add-host').val(),
        port: this.$el.find('input#stratum-client-add-port').val(),
        user: this.$el.find('input#stratum-client-add-user').val(),
        password: this.$el.find('input#stratum-client-add-password').val()
      }).then(function() {
          this.trigger('save', this.model);
        }.bind(this));
    }
  });

  exports.View = Marionette.View.extend({
    el: $('.stratum-client'),
    events: {
      'click .btn.stratum-client-add-button': 'addClient'
    },

    initialize: function (options) {
      if (!(options && options.collection)) {
        throw new Error("Must include a collection")
      }

      this.collection = options.collection;
      this.collection.on('add', this.render, this);
    },

    render: function () {
      this.$el.empty();
      var collectionView = new CollectionView({collection: this.collection});
      this.$el.append(collectionView.render().$el);
      this.$el.append($('#tmpl-_stratum-client-add').html());
    },

    addClient: function (event) {
      var model = new this.collection.model();
      model.urlRoot = this.collection.url;
      var form = new FormView({
        model: model
      });
      form.once('save cancel', function (model) {
        this.collection.add(model);
      }.bind(this));
      var addEl = this.$el.find('.stratum-client-add');
      addEl.empty();
      addEl.append(form.render().$el);
    }
  });
});