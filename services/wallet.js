/**
 * Created by jdean on 2/22/14.
 */

var ObjectId = require('mongoose').Schema.ObjectId;

exports.find = function (req, res) {
  req.app.db.model('Wallet').find({}, function(err , wallet){
    if (!wallet.length) {
      console.log('Creating new wallet');
      req.app.db.model('Wallet').create([{
        port: 7245,
        host: 'localhost',
        shortName: 'LBW',
        fullName: 'Leboskis'
      }], function (err, lbw) {
        if (!err) {
          console.log('Created new wallet');
          res(JSON.stringify(lbw));
        } else {
          console.log('error creating new wallet');
        }
      })
    } else {
      console.log('sending all wallets');
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(wallet));
    }

  });
};

exports.read = function (req, res) {
  req.app.db.collection('Wallets').findOne({_id: req.params.id} , function(err , success){
    console.log('Response success '+success);
    console.log('Response error '+err);
    if(success){
      res.send(200 , success);
    } else {
      return err;
    }

  });
}

function typeCastWallet(wallet) {
  return {
    fullName: wallet.fullName,
    shortName: wallet.shortName,
    host: wallet.host,
    port: wallet.port,
    rpcUser: wallet.rpcUser,
    rpcPassword: wallet.rpcPassword
  }
}

function validateWallet(wallet) {
  return typeCastWallet(wallet);
}

exports.create = function (req, res) {
  var walletData = validateWallet(req.body);
  if (walletData) {
    req.app.db.model('Wallet').create([req.body], function (err, wallet) {
      if (err) {
        res.send(500, 'Failed to create wallet');
        return err;
      }
      res.setHeader('Content-Type', 'application/json');
      return res.send(201, JSON.stringify(wallet));
    });
  } else {
    res.send(500, 'Failed to validate wallet data');
  }
}

exports.delete = function (req, res) {
  return req.app.db.model('Wallet').findById(req.params.id, function (err, wallet) {
    return wallet.remove(function (err) {
      if (!err) {
        console.log("removed wallet " + wallet._id);
        return res.send('');
      } else {
        console.log(err);
      }
    });
  });
};

exports.update = function (req, res) {
  console.log('starting wallet update at ' + req.params.id);
  var walletData = typeCastWallet(req.body);
  console.log('received wallet data: ' + JSON.stringify(walletData));
  if (walletData) {
    req.app.db.model('Wallet').findById(req.params.id, function(err , wallet) {
      if(wallet) {
        console.log('Found wallet');
        Object.keys(walletData).forEach(function (key) {
          wallet[key] = walletData[key];
        });
        wallet.save(function (err, product, numberAffected) {
          if (product && numberAffected === 1) {
            res.send(200 , wallet);
          } else if (product && numberAffected === 0) {
            res.send(304, wallet);
          } else if (err) {
            res.send(500, err);
          } else {
            res.send(500, 'error');
          }
        });

      } else {
        console.log('no wallet found!');
        res.send(404);
        return err;
      }
    });
  } else {
    res.send(500, 'Failed to validate wallet data');
  }
}