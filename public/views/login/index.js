/* global app:true */

define(function (require, exports, module) {
  'use strict';

  var Backbone = require('backbone');
  var $ = require('jquery');
  var _ = require('underscore');

  exports.Login = Backbone.Model.extend({
    url: '/login/',
    defaults: {
      errors: [],
      errfor: {},
      username: '',
      password: ''
    }
  });

  exports.LoginView = Backbone.View.extend({
    el: '#login',
    template: _.template( $('#tmpl-login').html() ),
    events: {
      'submit form': 'preventSubmit',
      'keypress [name="password"]': 'loginOnEnter',
      'click .btn-login': 'login'
    },
    initialize: function() {
      this.model = new exports.Login();
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
      this.$el.find('[name="username"]').focus();
    },
    preventSubmit: function(event) {
      event.preventDefault();
    },
    loginOnEnter: function(event) {
      if (event.keyCode !== 13) { return; }
      if ($(event.target).attr('name') !== 'password') { return; }
      event.preventDefault();
      this.login();
    },
    login: function() {
      this.$el.find('.btn-login').attr('disabled', true);

      this.model.save({
        username: this.$el.find('[name="username"]').val(),
        password: this.$el.find('[name="password"]').val()
      },{
        success: function(model, response) {
          if (response.success) {
            location.href = '/login/';
          }
          else {
            model.set(response);
          }
        }
      });
    }
  });

  $(document).ready(function() {
    exports.loginView = new exports.LoginView();
  });
});
