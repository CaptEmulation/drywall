/**
 * Created by jdean on 3/23/14.
 */
define(function (require, exports, module) {
  'use strict';

  var Marionette = require('marionette');
  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');
  var io = require('socket.io');
  var confirmDangerousAction = require('stratum/utils').confirmDangerousAction;

  var Row = Marionette.ItemView.extend({
    template: '#tmpl-_stratum-proxy-row',
    className: 'row',
    events: {
      'click .btn.stratum-proxy-view': 'onView',
      'click .btn.stratum-proxy-edit': 'onEdit',
      'click .btn.stratum-proxy-delete': 'onDelete'
    },

    templateHelpers: function () {
      return {
        clientDescription: this.model.getDescription()
      };
    },

    onView: function () {
      var socket = io.connect('http://localhost:8081');
      socket.on('stratum.proxy', function (data) {
        this.model.set('log', data);
      }.bind(this));
      $.ajax({
        url: '/sl/stratum/proxy/' + this.model.id + '/start'
      }).then(function () {
          var proxyView = new ProxyView({
            model: this.model
          });
          this.$el.append(proxyView.render().$el);
          this.model.set('log', "Loading proxy...<br>");
        }.bind(this));

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
        this.actionConfirmer = confirmDangerousAction(this.$el.find('.btn.stratum-proxy-delete'), function () {
          this.model.destroy();
        }.bind(this));
      }
      this.actionConfirmer();
    }
  });

  var ProxyInputItem = Marionette.ItemView.extend({
    template: '#tmpl-_stratum-proxy-row-form-client-field',
    tagName: 'option',
    templateHelpers: function () {
      return {
        client: this.model.getDescription()
      };
    }
  });

  var ProxyInputCollection = Marionette.CollectionView.extend({
    tagName: 'select',
    className: 'form-control',
    itemView: ProxyInputItem,
    getSelectedId: function () {
      return this.collection.at(this.$el[0].selectedIndex).id;
    }
  });

  var CollectionView = Marionette.CollectionView.extend({
    itemView: Row,
    className: 'col-lg-12'
  });

  var FormView = Marionette.ItemView.extend({
    template: '#tmpl-_stratum-proxy-row-form',
    className: 'row',
    events: {
      'click .btn.stratum-proxy-cancel': 'onCancel',
      'click .btn.stratum-proxy-save': 'onSave'
    },

    onRender: function () {
      var el = this.$el.find('.stratum-proxy-client-field');
      this.clientSelect = new ProxyInputCollection({
        collection: this.model.collection.clients
      });
      el.append(this.clientSelect.render().$el);
    },

    onCancel: function () {
      this.trigger('cancel');
    },

    onSave: function () {
      // Match clientId

      this.model.save({
        clientId: this.clientSelect.getSelectedId(),
        port: this.$el.find('input#stratum-proxy-add-port').val(),
        user: this.$el.find('input#stratum-proxy-add-user').val(),
        password: this.$el.find('input#stratum-proxy-add-password').val()
      }).then(function() {
          this.trigger('save', this.model);
        }.bind(this));
    }
  });

  exports.View = Marionette.View.extend({
    el: $('.stratum-proxy'),
    events: {
      'click .btn.stratum-proxy-add-button': 'addProxy'
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
      this.$el.append($('#tmpl-_stratum-proxy-row-header').html());
      this.$el.append(collectionView.render().$el);
      this.$el.append($('#tmpl-_stratum-proxy-add').html());
      return this;
    },

    addProxy: function () {
      var model = new this.collection.model();
      model.collection = this.collection;
      var form = new FormView({
        model: model
      });
      form.once('save cancel', function (model) {
        this.collection.add(model);
      }.bind(this));
      var addEl = this.$el.find('.stratum-proxy-add');
      addEl.empty();
      addEl.append(form.render().$el);
    }
  });

  var ProxyView = exports.ProxyView = Marionette.View.extend({
    template: _.template($('#tmpl-_stratum-proxy-view').html()),
    initialize: function (options) {
      this.model = options.model;
      this.listenTo(this.model, 'change:log', this.onLog);
      Marionette.View.prototype.initialize.apply(this, arguments);
    },
    render: function () {
      this.$el.empty();
      this.$el.append(this.template({
        client: this.model.getDescription()
      }));
      return this;
    },
    onLog: function () {
      if (!this.logElement) {
        this.logElement = this.$el.find('.stratum-proxy-view');
      }
      var data = this.model.get('log');
      if (typeof data === 'object') {
        if (data.type && data.type.indexOf('Buffer') !== -1 && data.msg) {
          data = data.msg;
        } else {
          data = JSON.stringify(data, null, 2);
        }
      }
      data += '<BR>';
      this.logElement.append(data);
      this.model.set('log', '', {
        silent: true
      });
    }
  });
});