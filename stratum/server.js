/**
 * Created by jdean on 3/23/14.
 */

var Q = require('q');
var net = require('net');

var once = exports.onceThen = function (first, then) {
  var run = false;
  return function () {
    if (run) {
      then.apply(this, arguments);
    } else {
      first.apply(this, arguments);
    }
  }
}

function paramsMatchServerPassword(data, serverModel) {
  return !(data.params[0].indexOf(serverModel.user) || serverModel.user.indexOf(data.params[0])
    || data.params[1].indexOf(serverModel.password) || serverModel.password.indexOf(data.params[1]));
}

var parseJson = function (str) {
  var json;
  try {
    json = JSON.parse(str);
  } catch (e) {
    console.log('Not able to parse: ' + str + ' due to: ' + e.message + ':' + e.stack);
  }
  return json || {};
};

var miningAuthorized = function (client, serverModel, target, defer) {
  return function (str) {

    var data = parseJson(str);
    if (data && !defer.isFulfilled && data.method && data.method.indexOf('mining.authorize') !== -1) {
      if (data.params && Array.isArray(data.params) && paramsMatchServerPassword(data, serverModel)) {
        client.write(JSON.stringify({
          id: data.id,
          error: "null",
          "result": true
        }) + '\n');
        defer.resolve();
        return;
      }
      client.write(JSON.stringify({
        id: data.id,
        error: "not authorized",
        "result": false
      }) + '\n');
      client.end();
      defer.reject();
    } else {
      target.write(str);
    }

  }
};

exports.create = function (options) {

  if (!(options && options.server && options.target)) {
    throw new Error("Must include required options to start stratum server.  Got: " + options);
  }
  var target = options.target;
  var defer = Q.defer();

  var server = net.createServer(function (client) {
    var authorizedDefer = Q.defer();
    var authorizationHandler = miningAuthorized(client, options.server, target, authorizedDefer);

    client.on('end', function () {

    });

    client.on('data', function (data) {

      if (authorizedDefer.isFulfilled) {
        target.write(data);
      } else {
        authorizationHandler(data);
      }

    });
    defer.resolve(self);
  });

  target.on('data', function (data) {
    server.write(data);
  });

  var self = {
    listen: function () {

      var defer = Q.defer();
      server.listen(options.server.port, function () {
        defer.resolve(server);
      });
      return defer.promise;
    },
    server: server,
    loaded: defer.promise
  };

  return defer.promise;
};

exports.create2 = function (options) {
  if (!(options && options.port && options.user && options.password)) {
    throw new Error("Must include required options to start stratum server.  Got: " + options);
  }

  var loadedDefer = Q.defer();
  var port = options.port, user = options.user, password = options.password;
  var Server = Stratum.Server;
  var server = Server.create({
    settings: {
      port: port
    }
  });

  server.listen().then(function (port){
    console.log(port);
    loadedDefer.resolve();
  });

  server.on('mining', function (req, deferred, socket) {
    console.log('Client is asking for subscription!');
    // returns a mining.notify command to the client
    //
    // Resolve the deferred, so the command is sent to the socket

    deferred // difficulty, subscription_id, extranonce1, extranonce2_size
      .resolve(['b4b6693b72a50c7116db18d6497cac52','ae6812eb4cd7735a302a8a9dd95cf71f', '08000002', 4]);
  });

  var self = {
    instance: server,
    loaded: loadedDefer.promise
  };

  return self;
}