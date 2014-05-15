/**
 * Created by jdean on 3/23/14.
 */

var Stratum = require('stratum');
var createServer = require('./server').create;
var Q = require('q');

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
            exports.createProxy({
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
              }
            });

            res.send(200);
          }
        });
      }
    });
  }
}

var qSocket = Q.defer();

require('../socket.io/main').on('connection', function (socket) {
  console.log('received socket io connection');
  qSocket.resolve(socket);
});

var createClient = function (options) {

  console.log('inside createClient');

  if (!(options && options.user && options.password && options.host && options.port && options.server)) {
    throw new Error('invalid options: ' + options);
  }
  var clientDefer = Q.defer(), user = options.user, password = options.password, host = options.host, port = options.port, server = options.server;

  var client = Stratum.Client.create();

  console.log('-- error handler');

//must be specified per EventEmitter requirements
//  client.on('error', function(socket, arg2){
//      console.log('fatal error: ' + JSON.stringify(arg2, null, 2));
////    socket.destroy();
////    console.log('Connection closed');
////    process.exit(1);
//  });
//
//  console.log('-- mining error handler');
//
//// this usually happens when we are not authorized to send commands (the server didn't allow us)
//// or share was rejected
//// Stratum errors are usually an array with 3 items [int, string, null]
//  client.on('mining.error', function(msg, socket){
//    console.log(msg);
//  });
//
//  console.log('-- mining handler');
//
// the client is a one-way communication, it receives data from the server after issuing commands
  client.on('mining', function(data, socket, type){
    console.log('mining message received');
    if (!socket.authorized){
      console.log('Client sending authorization');
      socket.stratumAuthorize(user, password);
    } else {
      console.log('Received data: ' + data);
      qSocket.promise.then(function (socket) {
        socket.emit('stratum.proxy.mining', data);
      });
      server.notify(data);
    }

  });

  console.log('Creating stratum client connection at ' + host + ':' + port);

//  client.connect({
//    host: host,
//    port: port
//  }).then(function (socket){
//
//  ;

}



exports.createProxy = function (options) {
  if (!(options && options.server && options.client)) {
    throw new Error("Must include client and server options");
  }

  var clientOpt = options.client, serverOpt = options.server;

  if (!(serverOpt.port && serverOpt.user && serverOpt.password)) {
    throw new Error("Must include required options to start stratum server.  Got: " + JSON.stringify(serverOpt, null, 2));
  }

  if (!(clientOpt.user && clientOpt.password && clientOpt.host && clientOpt.port)) {
    throw new Error('Must include required options to start stratum server.  Got: ' + JSON.stringify(clientOpt, null, 2));
  }

  var loadedDefer = Q.defer();
  var Server = Stratum.Server;
  var server = Server.create({
    settings: {
      port: serverOpt.port
    }
  });

  server.listen().then(function (msg){
    console.log(msg);
    loadedDefer.resolve(server);
  });



  loadedDefer.promise.then(function (server) {
    console.log('Creating client');
    var client = Stratum.Client.create();

    client.on('mining', function(data, socket, type) {
      console.log('Mining data: ' + type + ' = ', data);
      // you can issue more commands to the socket, it's the exact same socket as "client" variable
      // in this example

      // the socket (client) got some fields like:
      // client.name = name of the worker
      // client.authorized = if the current connection is authorized or not
      // client.id = an UUID ([U]niversal [U]nique [ID]entifier) that you can safely rely on it's uniqueness
      // client.subscription = the subscription data from the server
      switch (data.method) {
        case 'set_difficulty':
          // server sent the new difficulty
          break;
        case 'notify':
          // server sent a new block
          break;
        default:
          if (!socket.authorized){
            console.log('Asking for authorization');
            socket.stratumAuthorize(clientOpt.user,clientOpt.password);
          } else {
            console.log('Client received: ' + JSON.stringify(data, null, 2));
          }
      }
    });
    var subscribed, authorized;
    server.on('mining', function (req, deferred, socket) {
      console.log('Server received mining request');
      if (!subscribed) {
        console.log('Creating client connection to ' + clientOpt.host + ':' + clientOpt.port);
        client.connect({
          host: clientOpt.host,
          port: clientOpt.port
        }).then(function (socket){
            subscribed = true
            console.log('Client connected to host');
            socket.stratumSubscribe(req.params[0]).then(function (data) {
              console.log('Client connected and subscribed with response: ' + JSON.stringify(data, null, 2));
              deferred.resolve(data);
            });
          });
      }
    });
  });
}