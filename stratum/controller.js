
var Q = require('q');
var stratum = require('stratum-proxy');


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


exports.start = function (app) {
  var defer = Q.defer();
  console.log('flib');
  app.db.model('StratumProxy').find({}, function (err, models) {
    console.log('foo');
    var stratumProxyData;
    if (models.length) {
      stratumProxyData = models[0];
      if(stratumProxyData.clientId) {
        console.log('nooo');
        app.db.model('StratumClient').find( { _id: stratumProxyData.clientId }, function (err, models) {
          console.log('yes');
          var stratumClientData;
          if (models.length) {
            stratumClientData = models[0];
            console.log('Starting strarum proxy at ' + stratumProxyData.toUrl() + ' point at ' + stratumClientData.toUrl());
            stratum.controller.create({
              target: stratumClientData,
              server: stratumProxyData
              }).then(function () {
                console.log('Stratum proxy started');
                defer.resolve();
              });
          }
        });
      }
    }
  });
  return defer.promise;
};
