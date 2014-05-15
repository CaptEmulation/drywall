/**
 * Created by jdean on 4/16/14.
 */


var sinon = require('sinon');


var library = exports.library = {
  fooClient: function () {
    return {
      _id: 'foo',
      user: 'foo',
      password: 'bar',
      port: '1600',
      host: 'foo-host'
    }
  },
  stubSocket: function () {
    return {
      write: sinon.stub(),
      on: sinon.stub(),
      end: sinon.stub()
    };
  },
  fooServer: function () {
    return {
      user: 'foo',
      password: 'bar',
      port: '1600',
      clientId: 'foo'
    };
  },
  stubServerSocket:function () {
    return {
      on: sinon.stub(),
      listen: sinon.stub().yieldsAsync(),
      write: sinon.stub()
    };
  }
}

exports.tester = {
  controller: function (controller) {
    var options = {};

    var self = {
      create: function () {

        return controller.start(options);
      }
    }
    return self;
  },
  client: function tester(client) {
    var options = {};

    var self = {
      create: function () {
        if (!options.socket) {
          self.withNullSocket();
        }
        if (!options.client) {
          self.withFooClient();
        }
        return client.create(options);
      },
      withNullSocket: function () {
        options.socket = library.stubSocket();
        return self;
      },
      withFooClient: function () {
        options.client = library.fooClient();
        return self;
      },
      options: options
    };

    return self;
  },
  server: function tester(server) {
    var options = {};
    var autoConnected;

    var self = {
      create: function (done) {
        if (!options.server) {
          self.withFooServer();
        }
        if (!options.target) {
          self.withStubTarget();
        }

        var server_impl = server.create(options);
        server_impl.then(function (server) {
          if (autoConnected) {
            server.listen().then(function () {
              done();
            });
          }
        });

        return server_impl;
      },
      withFooServer: function () {
        options.server = library.fooServer();
        return self;
      },
      withStubTarget: function () {
        options.target = library.stubSocket();
        return self;
      },
      withAutoConnection: function () {
        autoConnected = true;
        return self;
      },
      options: options
    };

    return self;
  },
  target: function tester(target) {
    var options = {};

    var self = {
      create: function () {
        if (!options.client) {
          self.withFooClient();
        }
        if (!options.socket) {
          self.withStubSocket();
        }

        return target.create(options);
      },
      withFooClient: function () {
        options.client = library.fooClient();
        return self;
      },
      withStubSocket: function () {
        options.socket = library.stubSocket();
        return self;
      },
      options: options
    };

    return self;
  }

}