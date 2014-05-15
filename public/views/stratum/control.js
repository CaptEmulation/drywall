/**
 * Created by jdean on 3/23/14.
 */


define(function (require, exports, module) {
  'use strict';

  var Marionette = require('marionette');
  var $ = require('jquery');
  var Backbone = require('backbone');

  exports.FormModel = Backbone.Model.extend({
    defaults: {
      start: 'Start',
      running: false
    }
  });

  exports.StatusModel = Backbone.Model.extend({
    defaults: {
      status: 'Not Running'
    },

    running: function (model) {
      this.set('status', model.get('running') ? 'Running': 'Not Running');
    }
  });

  exports.FormView = Marionette.ItemView.extend({
    template: '#tmpl-_stratum-control',
    el: $('.stratum-control'),
    events: {
      'click .stratum-control-button': 'buttonHandler'
    },

    initialize: function () {
      this.listenTo(this.model, 'change:start', this.render);
      this.listenTo(this, 'render', this.applyStatusColor);
      Marionette.ItemView.prototype.initialize.apply(this, arguments);
    },

    buttonHandler: function (event) {
      var button = $(event.currentTarget);
      if (this.model.get('running')) {
        $.ajax({
          url: '/sl/stratum/stop'
        }).then(function () {
            this.model.set('running', false);
            this.model.set('start', 'Start');
          }.bind(this));
      } else {
        $.ajax({
          url: '/sl/stratum/start'
        }).then(function () {
            this.model.set('running', true);
            this.model.set('start', 'Stop');
          }.bind(this));
      }
    },

    applyStatusColor: function () {
      if (this.model.get('running')) {
        var button = this.$el.find('.btn');
        button.removeClass('btn-primary')
        button.addClass('btn-success');
      }
    },

  });

  exports.StatusView = Marionette.ItemView.extend({
    template: '#tmpl-_stratum-control-status',
    el: $('.stratum-control-status'),
    initialize: function () {
      this.listenTo(this.model, 'change:status', this.render);
      Marionette.ItemView.prototype.initialize.apply(this, arguments);
    }
  });
});