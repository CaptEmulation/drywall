/**
 * Created by jdean on 3/23/14.
 */

var ObjectId = require('mongoose').Schema.ObjectId;


var client = exports.client = {};
var proxy = exports.proxy = {};

client.find = function (req, res) {
  req.app.db.model('StratumClient').find({}, function(err , stratumClient){
    if (!stratumClient.length) {
      res.send(200, '[]');
    } else {
      console.log('sending all stratumClients');
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(stratumClient));
    }

  });
};

client.read = function (req, res) {
  req.app.db.collection('StratumClients').findOne({_id: req.params.id} , function(err , success){
    console.log('Response success '+success);
    console.log('Response error '+err);
    if(success){
      res.send(200 , success);
    } else {
      return err;
    }

  });
}

function typeCastStratumClient(stratumClient) {
  return {
    name: stratumClient.name,
    host: stratumClient.host,
    port: stratumClient.port,
    user: stratumClient.user,
    password: stratumClient.password
  }
}

function validateStratumClient(stratumClient) {
  return typeCastStratumClient(stratumClient);
}

client.create = function (req, res) {
  var stratumClientData = validateStratumClient(req.body);
  if (stratumClientData) {
    req.app.db.model('StratumClient').create([req.body], function (err, stratumClient) {
      if (err) {
        res.send(500, 'Failed to create stratumClient');
        return err;
      }
      res.setHeader('Content-Type', 'application/json');
      return res.send(201, JSON.stringify(stratumClient));
    });
  } else {
    res.send(500, 'Failed to validate stratumClient data');
  }
}

client.delete = function (req, res) {
  return req.app.db.model('StratumClient').findById(req.params.id, function (err, stratumClient) {
    return stratumClient.remove(function (err) {
      if (!err) {
        console.log("removed stratumClient " + stratumClient._id);
        return res.send('');
      } else {
        console.log(err);
      }
    });
  });
};

client.update = function (req, res) {
  console.log('starting stratumClient update at ' + req.params.id);
  var stratumClientData = typeCastStratumClient(req.body);
  console.log('received stratumClient data: ' + JSON.stringify(stratumClientData));
  if (stratumClientData) {
    req.app.db.model('StratumClient').findById(req.params.id, function(err , stratumClient) {
      if(stratumClient) {
        console.log('Found stratumClient');
        Object.keys(stratumClientData).forEach(function (key) {
          stratumClient[key] = stratumClientData[key];
        });
        stratumClient.save(function (err, product, numberAffected) {
          if (product && numberAffected === 1) {
            res.send(304 , stratumClient);
          } else if (product && numberAffected === 0) {
            res.send(200, stratumClient);
          } else if (err) {
            res.send(500, err);
          } else {
            res.send(500, 'error');
          }
        });

      } else {
        console.log('no stratumClient found!');
        res.send(404);
        return err;
      }
    });
  } else {
    res.send(500, 'Failed to validate stratumClient data');
  }
};


proxy.find = function (req, res) {
  req.app.db.model('StratumProxy').find({}, function(err , stratumProxy){
    if (!stratumProxy.length) {
      res.send(200, '[]');
    } else {
      console.log('sending all stratumProxys');
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(stratumProxy));
    }

  });
};

proxy.read = function (req, res) {
  req.app.db.collection('StratumProxys').findOne({_id: req.params.id} , function(err , success){
    console.log('Response success '+success);
    console.log('Response error '+err);
    if(success){
      res.send(200 , success);
    } else {
      return err;
    }

  });
}

function typeCastStratumProxy(stratumProxy) {
  return {
    clientId: stratumProxy.clientId,
    port: stratumProxy.port,
    user: stratumProxy.user,
    password: stratumProxy.password
  }
}

function validateStratumProxy(stratumProxy) {
  return typeCastStratumProxy(stratumProxy);
}

proxy.create = function (req, res) {
  var stratumProxyData = validateStratumProxy(req.body);
  if (stratumProxyData) {
    req.app.db.model('StratumProxy').create([req.body], function (err, stratumProxy) {
      if (err) {
        res.send(500, 'Failed to create stratumProxy');
        return err;
      }
      res.setHeader('Content-Type', 'application/json');
      return res.send(201, JSON.stringify(stratumProxy));
    });
  } else {
    res.send(500, 'Failed to validate stratumProxy data');
  }
}

proxy.delete = function (req, res) {
  return req.app.db.model('StratumProxy').findById(req.params.id, function (err, stratumProxy) {
    return stratumProxy.remove(function (err) {
      if (!err) {
        console.log("removed stratumProxy " + stratumProxy._id);
        return res.send('');
      } else {
        console.log(err);
      }
    });
  });
};

proxy.update = function (req, res) {
  console.log('starting stratumProxy update at ' + req.params.id);
  var stratumProxyData = typeCastStratumProxy(req.body);
  console.log('received stratumProxy data: ' + JSON.stringify(stratumProxyData));
  if (stratumProxyData) {
    req.app.db.model('StratumProxy').findById(req.params.id, function(err , stratumProxy) {
      if(stratumProxy) {
        console.log('Found stratumProxy');
        Object.keys(stratumProxyData).forEach(function (key) {
          stratumProxy[key] = stratumProxyData[key];
        });
        stratumProxy.save(function (err, product, numberAffected) {
          if (product && numberAffected === 0) {
            res.send(304 , stratumProxy);
          } else if (product && numberAffected === 1) {
            res.send(200, stratumProxy);
          } else if (err) {
            res.send(500, err);
          } else {
            res.send(500, 'error');
          }
        });

      } else {
        console.log('no stratumProxy found!');
        res.send(404);
        return err;
      }
    });
  } else {
    res.send(500, 'Failed to validate stratumProxy data');
  }
};