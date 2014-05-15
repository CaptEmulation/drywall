/**
 * Created by jdean on 3/30/14.
 */


var createStratumSocket = require('./socket').create;
var Q = require('q');

var MAX_INT = Math.pow(2, 32);

exports.create = function (options) {

  var waitForAuthorizedDefer = Q.defer(), waitForAuthorizedResponseDefer, loaded = Q.defer();

  var inClientSocket = options.socket, outClientSocket, clientModel = options.client, authorizeId = Math.abs(Math.random() * MAX_INT) | 0;

  var rawSocket = net.connect({
    port: clientModel.port,
    host: clientModel.host
  }, function () {
    outClientSocket = createStratumSocket(rawSocket);
    outClientSocket.on('data', function (data) {
      if (!waitForAuthorizedDefer.isFulfilled && !waitForAuthorizedResponseDefer) {
        waitForAuthorizedResponseDefer = Q.defer();
        outClientSocket.write(JSON.stringify({
          method: 'mining.authorize',
          params: [ clientModel.user, clientModel.password ],
          id: authorizeId
        }));
      }

      if (!waitForAuthorizedResponseDefer || (waitForAuthorizedResponseDefer && waitForAuthorizedResponseDefer.isFulfilled)) {
        inClientSocket.write(data);
      } else {
        var jsonData = JSON.parse(data);
        if (jsonData.id == authorizeId) {
          if (jsonData.error.indexOf('null') !== -1 && jsonData.result) {
            waitForAuthorizedResponseDefer.resolve();
          } else {
            waitForAuthorizedResponseDefer.reject();
          }

        } else {
          inClientSocket.write(data);
        }
      }
    });

    outClientSocket.on('end', function () {
      inClientSocket.end();
    });

    loaded.resolve(self);
  });

  loaded.promise.then(function () {
    inClientSocket.on('data', function (data) {
      outClientSocket.write(data);
    });

    inClientSocket.on('end', function  () {
      outClientSocket.end();
    });

    self.inClientSocket = inClientSocket;
    self.outClientSocket = outClientSocket;
  });

  var self = {
    loaded: loaded.promise,
    authorized: waitForAuthorizedDefer.promise
  };
  return self;
};