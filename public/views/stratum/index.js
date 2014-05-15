/**
 * Created by jdean on 3/22/14.
 */



define(function (require, exports, module) {
  'use strict';

  var control = require('stratum/control');
  var client = require('stratum/client')
  var proxy = require('stratum/proxy');
  var model = require('stratum/model');
  var $ = require('jquery');

  var stratumControlForm = new control.FormView({
    model: new control.FormModel()
  });

  stratumControlForm.render();

  var stratumControlStatus = new control.StatusView({
    model: new control.StatusModel()
  });

  stratumControlStatus.render();

  stratumControlForm.model.on('change:running', stratumControlStatus.model.running, stratumControlStatus.model);

  var clientCollection = new model.ClientCollection();
  var clientPromise = clientCollection.fetch();
  clientPromise.then(function () {
    var clientView = new client.View({
      collection: clientCollection
    });
    clientView.render();
  });

  var proxyCollection = new model.ProxyCollection();
  var proxyPromise = proxyCollection.fetch();
  $.when([clientPromise, proxyPromise]).then(function () {
    proxyCollection.clients = clientCollection;
    var stratumProxyView = new proxy.View({
      collection: proxyCollection
    });
    stratumProxyView.render();
  })

});