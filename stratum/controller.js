
var Q = require('q');
var EventEmitter = require('eventemitter3').EventEmitter;
var createServer = require('./server').create;
var createTarget = require('./target').create;

var MiddlewareSocket = require('es5class').$define('MiddlewareSocket', {
  setSocket: function (socket) {
    this._socket = socket;
  },
  write: function (data) {
    this._socket.emit('data', data);
  },
  end: function () {
    this._socket.emit('end');
  }
}).$implement(EventEmitter, true);


createMiddlewareSocket = function () {
  var socket = new MiddlewareSocket();
  return socket;
}

function findProxies(app, attr) {
  attr = attr || {};
  var stratumProxyModel = app.db.model('StratumProxy');
  return stratumProxyModel.qFind(attr);
}

function findClients(app, attr) {
  attr = attr || {};
  var stratumClientModel = app.db.model('StratumClient');
  return stratumClientModel.qFind(attr);
}

exports.connectTargetToServer = function (target, server) {
  var defer = Q.defer();
  var targetAvailable = target.loaded;
  var serverInitialized = server.loaded;
  Q.all([
    targetAvailable,
    serverInitialized
  ]).done(function () {
    target.middle.setSocket(server.middle);
    server.middle.setSocket(target.middle);
    defer.resolve();
  });
  return defer.promise;
}

exports.start = function (app) {
  var defer = Q.defer();
  findProxies(app).then(function (models) {
    var stratumProxyData;
    if (models.length) {
      stratumProxyData = models[0];
      if(stratumProxyData.clientId) {
        findClients(app, { '_id': stratumProxyData.clientId}).then(function (models) {
          var stratumClientData;
          if (models.length) {
            stratumClientData = models[0];
            var middleTargetSocket = createMiddlewareSocket();
            var middleServerSocket = createMiddlewareSocket();
            var target = createTarget({ client:stratumClientData, socket: middleTargetSocket});
            var server = createServer({ server:stratumProxyData, socket: middleServerSocket});
            exports.connectTargetToServer(target, server).then(function () {
              defer.resolve();
            });
          }
        });
      }
    }
  });
  return defer.promise;
};
