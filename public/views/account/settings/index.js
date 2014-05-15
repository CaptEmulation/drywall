/* global app:true */

/* global app:true */

define(function (require, exports, module) {
  'use strict';

  var Backbone = require('backbone');
  var $ = require('jquery');
  var _ = require('underscore');

  exports.Account = Backbone.Model.extend({
    idAttribute: '_id',
    url: '/account/settings/'
  });

  exports.User = Backbone.Model.extend({
    idAttribute: '_id',
    url: '/account/settings/'
  });

  exports.Details = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      success: false,
      errors: [],
      errfor: {},
      first: '',
      middle: '',
      last: '',
      company: '',
      phone: '',
      zip: ''
    },
    url: '/account/settings/',
    parse: function(response) {
      if (response.account) {
        exports.mainView.account.set(response.account);
        delete response.account;
      }

      return response;
    }
  });

  exports.Identity = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      success: false,
      errors: [],
      errfor: {},
      username: '',
      email: ''
    },
    url: '/account/settings/identity/',
    parse: function(response) {
      if (response.user) {
        exports.mainView.user.set(response.user);
        delete response.user;
      }

      return response;
    }
  });

  exports.Password = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      success: false,
      errors: [],
      errfor: {},
      newPassword: '',
      confirm: ''
    },
    url: '/account/settings/password/',
    parse: function(response) {
      if (response.user) {
        exports.mainView.user.set(response.user);
        delete response.user;
      }

      return response;
    }
  });

  exports.DetailsView = Backbone.View.extend({
    el: '#details',
    template: _.template( $('#tmpl-details').html() ),
    events: {
      'click .btn-update': 'update'
    },
    initialize: function() {
      this.model = new exports.Details();
      this.syncUp();
      this.listenTo(exports.mainView.account, 'change', this.syncUp);
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    syncUp: function() {
      this.model.set({
        _id: exports.mainView.account.id,
        first: exports.mainView.account.get('name').first,
        middle: exports.mainView.account.get('name').middle,
        last: exports.mainView.account.get('name').last,
        company: exports.mainView.account.get('company'),
        phone: exports.mainView.account.get('phone'),
        zip: exports.mainView.account.get('zip')
      });
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));

      for (var key in this.model.attributes) {
        if (this.model.attributes.hasOwnProperty(key)) {
          this.$el.find('[name="'+ key +'"]').val(this.model.attributes[key]);
        }
      }
    },
    update: function() {
      this.model.save({
        first: this.$el.find('[name="first"]').val(),
        middle: this.$el.find('[name="middle"]').val(),
        last: this.$el.find('[name="last"]').val(),
        company: this.$el.find('[name="company"]').val(),
        phone: this.$el.find('[name="phone"]').val(),
        zip: this.$el.find('[name="zip"]').val()
      });
    }
  });

  exports.IdentityView = Backbone.View.extend({
    el: '#identity',
    template: _.template( $('#tmpl-identity').html() ),
    events: {
      'click .btn-update': 'update'
    },
    initialize: function() {
      this.model = new exports.Identity();
      this.syncUp();
      this.listenTo(exports.mainView.user, 'change', this.syncUp);
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    syncUp: function() {
      this.model.set({
        _id: exports.mainView.user.id,
        username: exports.mainView.user.get('username'),
        email: exports.mainView.user.get('email')
      });
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));

      for (var key in this.model.attributes) {
        if (this.model.attributes.hasOwnProperty(key)) {
          this.$el.find('[name="'+ key +'"]').val(this.model.attributes[key]);
        }
      }
    },
    update: function() {
      this.model.save({
        username: this.$el.find('[name="username"]').val(),
        email: this.$el.find('[name="email"]').val()
      });
    }
  });

  exports.PasswordView = Backbone.View.extend({
    el: '#password',
    template: _.template( $('#tmpl-password').html() ),
    events: {
      'click .btn-password': 'password'
    },
    initialize: function() {
      this.model = new exports.Password({ _id: exports.mainView.user.id });
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));

      for (var key in this.model.attributes) {
        if (this.model.attributes.hasOwnProperty(key)) {
          this.$el.find('[name="'+ key +'"]').val(this.model.attributes[key]);
        }
      }
    },
    password: function() {
      this.model.save({
        newPassword: this.$el.find('[name="newPassword"]').val(),
        confirm: this.$el.find('[name="confirm"]').val()
      });
    }
  });

  exports.MainView = Backbone.View.extend({
    el: '.page .container',
    initialize: function() {
      exports.mainView = this;
      this.account = new exports.Account( JSON.parse( unescape($('#data-account').html()) ) );
      this.user = new exports.User( JSON.parse( unescape($('#data-user').html()) ) );

      exports.detailsView = new exports.DetailsView();
      exports.identityView = new exports.IdentityView();
      exports.passwordView = new exports.PasswordView();
    }
  });

  $(document).ready(function() {
    exports.mainView = new exports.MainView();
  });
});
