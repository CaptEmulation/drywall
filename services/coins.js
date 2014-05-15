/**
 * Created by jdean on 2/22/14.
 */

var ObjectId = require('mongoose').Schema.ObjectId;

exports.find = function (req, res) {
  req.app.db.model('Coin').find({}, function(err , coin){
    if (!coin.length) {
      console.log('Creating new coin');
      req.app.db.model('Coin').create([{
        port: 7245,
        host: 'localhost',
        shortName: 'LBW',
        fullName: 'Leboskis'
      }], function (err, lbw) {
        if (!err) {
          console.log('Created new coin');
          res(JSON.stringify(lbw));
        } else {
          console.log('error creating new coin');
        }
      })
    } else {
      console.log('sending all coins');
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(coin));
    }

  });
};

exports.read = function (req, res) {
  req.app.db.collection('Coins').findOne({_id: req.params.id} , function(err , success){
    console.log('Response success '+success);
    console.log('Response error '+err);
    if(success){
      res.send(200 , success);
    } else {
      return err;
    }

  });
}

function typeCastCoin(coin) {
  return {
    fullName: coin.fullName,
    shortName: coin.shortName,
    host: coin.host,
    port: coin.port,
    rpcUser: coin.rpcUser,
    rpcPassword: coin.rpcPassword
  }
}

function validateCoin(coin) {
  return typeCastCoin(coin);
}

exports.create = function (req, res) {
  var coinData = validateCoin(req.body);
  if (coinData) {
    req.app.db.model('Coin').create([req.body], function (err, coin) {
      if (err) {
        res.send(500, 'Failed to create coin');
        return err;
      }
      res.setHeader('Content-Type', 'application/json');
      return res.send(201, JSON.stringify(coin));
    });
  } else {
    res.send(500, 'Failed to validate coin data');
  }
}

exports.delete = function (req, res) {
  return req.app.db.model('Coin').findById(req.params.id, function (err, coin) {
    return coin.remove(function (err) {
      if (!err) {
        console.log("removed coin " + coin._id);
        return res.send('');
      } else {
        console.log(err);
      }
    });
  });
};

exports.update = function (req, res) {
  console.log('starting coin update at ' + req.params.id);
  var coinData = typeCastCoin(req.body);
  console.log('received coin data: ' + JSON.stringify(coinData));
  if (coinData) {
    req.app.db.model('Coin').findById(req.params.id, function(err , coin) {
      if(coin) {
        console.log('Found coin');
        Object.keys(coinData).forEach(function (key) {
          coin[key] = coinData[key];
        });
        coin.save(function (err, product, numberAffected) {
          if (product && numberAffected === 1) {
            res.send(304 , coin);
          } else if (product && numberAffected === 0) {
            res.send(200, coin);
          } else if (err) {
            res.send(500, err);
          } else {
            res.send(500, 'error');
          }
        });

      } else {
        console.log('no coin found!');
        res.send(404);
        return err;
      }
    });
  } else {
    res.send(500, 'Failed to validate coin data');
  }
}