/**
 * Created by jdean on 3/23/14.
 */

var Q = require('q');
var Stratum = require('stratum');

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

exports.create = function (options) {
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