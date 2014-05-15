/**
 * Created by jdean on 3/23/14.
 */

var Stratum = require('stratum');
var createServer = require('./server').create;
var Q = require('q');
var socket = require('../socket.io/main');
var _ = require('underscore');
var net = require('net');

var qSocket = Q.defer();
require('socket.io').listen(8081).on('connection', function (socket) {
  console.log('Resolving socket io connection');
  qSocket.resolve(socket);
});

exports.start = function (req, res) {
  if (!req.params.id) {
    res.send(400, {error: "No id provided"});
  } else {
    req.app.db.model('StratumProxy').find({}, function(err , stratumProxy){
      if (!stratumProxy.length) {
        res.send(404,  {error: "Proxy ID not found"});
      } else {
        var p = stratumProxy[0];
        req.app.db.model('StratumClient').find({_id: p.clientId }, function(err , clients){
          if (!clients.length) {
            res.send(404,  {error: "Client ID not found"});
          } else {
            var c = clients[0];

            exports.createProxy2({
              server: {
                user: p.user,
                password: p.password,
                port: p.port
              },
              client: {
                user: c.user,
                password: c.password,
                host: c.host,
                port: c.port,
              },
              webSocket: qSocket.promise
            });

            res.send(200);
          }
        });
      }
    });
  }
}


function optionsCheck(options) {
  if (!(options && options.server && options.client && options.webSocket)) {
    throw new Error("Must include client and server options");
  }

  var clientOpt = options.client, serverOpt = options.server;

  if (!(serverOpt.port && serverOpt.user && serverOpt.password)) {
    throw new Error("Must include required options to start stratum server.  Got: " + JSON.stringify(serverOpt, null, 2));
  }

  if (!(clientOpt.user && clientOpt.password && clientOpt.host && clientOpt.port)) {
    throw new Error('Must include required options to start stratum server.  Got: ' + JSON.stringify(clientOpt, null, 2));
  }
}

exports.createProxy2 = function (options) {
  optionsCheck(options);

  function emitToWebSocket(type, data) {
    if (typeof webSocket.emit === 'function') {
      console.log('emitting to websocket');
      webSocket.emit(type, data);
    }
  }



  var clientOpt = options.client, serverOpt = options.server;
  var webSocket = options.webSocket;

  if (typeof webSocket.then === 'function') {
    console.log('webSocket promise detected');
    webSocket.then(function (socket) {
      console.log('webSocket ready');
      webSocket = socket;
      emitToWebSocket('stratum.proxy', 'Proxy started');
    });
  }

  var server = net.createServer(function (c) {
    c.on('end', function  () {

    });

    c.on('data', function (data) {
      client.write(data);
      emitToWebSocket('stratum.proxy', '<< Client ' + data.toString());
    });

    var client = net.connect({
      port: clientOpt.port,
      host: clientOpt.host
    }, function () {
      client.on('data', function (data) {
        c.write(data);
        emitToWebSocket('stratum.proxy', '>> Server ' + data.toString());
      });

      client.on('end', function () {
        server.end();
      });
    });

  });


  server.listen(serverOpt.port, function () {

  });


}

exports.createProxy = function (options) {
  optionsCheck(options);
  var clientOpt = options.client, serverOpt = options.server;

  var loadedDefer = Q.defer();
  var webSocket = options.webSocket;
  var Server = Stratum.Server;
  var server = Server.create({
    settings: {
      port: serverOpt.port
    }
  });

  if (typeof webSocket.then === 'function') {
    console.log('webSocket promise detected');
    webSocket.then(function (socket) {
      console.log('webSocket ready');
      webSocket = socket;
      emitToWebSocket('stratum.proxy', 'Proxy started');
    });
  }



  server.listen().then(function (msg) {
    console.log(msg);
    loadedDefer.resolve(server);
  });


  loadedDefer.promise.then(function (server) {
    console.log('Creating client');
    var client = Stratum.Client.create();

    var clientIdSocketMap = {

    };

    function clientForConnetion(socket) {

      var subscribed;
      var socketId = socket.id;
      clientIdSocketMap[socketId] = socket;
      server.on('close', function (socket) {
        if (socketId === socket.id) {
          server.off(socket);
          clientIdSocketMap[socketId] = null;
        }
      });

      server.on('mining', function (req, deferred) {
        if (_.has(req, 'method')) {
          if (req.method.indexOf('mining.') !== -1) {
            var method = req.method.split('mining.')[0];
            if (method === 'authorize') {
              deferred.resolve([true]);
            } else {
              deferred.resolve(socket.stratumSend(req));
            }
          }
        }
      });

      client.on('mining', function (type, serverSocker) {
        console.log('Mining data: ' + type);
        // you can issue more commands to the socket, it's the exact same socket as "client" variable
        // in this example

        // the socket (client) got some fields like:
        // client.name = name of the worker
        // client.authorized = if the current connection is authorized or not
        // client.id = an UUID ([U]niversal [U]nique [ID]entifier) that you can safely rely on it's uniqueness
        // client.subscription = the subscription data from the server

        if (!socket.authorized) {
          console.log('Asking for authorization');
          socket.stratumAuthorize(clientOpt.user, clientOpt.password);
        } else {
          socket.stratumSend(req);
          emitToWebSocket('stratum.proxy', req);
        }
      });

      console.log('Client connected to host');
      socket.stratumSubscribe('bfgminer/3.10.0').then(function (data) {
        emitToWebSocket('stratum.proxy', data);
      });

      var self = {};

      return self;
    }


    server.on('connection', function (socket) {
      console.log('Creating client connection to ' + clientOpt.host + ':' + clientOpt.port);
      client.connect({
        host: clientOpt.host,
        port: clientOpt.port
      }).then(function (socket) {
          clientForConnetion(socket);
        });
    });
  });
};
