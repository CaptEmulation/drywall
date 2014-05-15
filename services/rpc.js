/**
 * Created by jdean on 2/22/14.
 */

var bitcoin = require('bitcoin');
var async = require('async');

var rpcToWallet = {
  'getbalance': function (wallet, options, callback) {
    var confirmations = options.confirmations || 6;
    return wallet.getBalance(function (err, balance) {
      if (err) return callback(console.log(err));
      return callback(err, {
        balance: balance
      });
    });
  },
  'getdifficulty': function (wallet, options, callback) {
    return wallet.getDifficulty(function (err, difficulty) {
      if (err) return callback(console.log(err));
      return callback(err, {
        difficulty: difficulty
      });
    });
  },
  'getblockcount': function (wallet, options, callback) {
    return wallet.getBlockCount(function (err, count) {
      console.log(err + count);
      if (err) return callback(console.log(err));
      return callback(err, {
        blockCount: count
      });
    });
  },
  'stat': function (wallet, options, callback) {

    var cmdBatch = [{
      method: 'getbalance'
    },
    {
      method: 'getdifficulty'
    },
    {
      method: 'getblockcount'
    }];
    var count = 0, statObj = {};
    wallet.cmd(cmdBatch, function (err, response) {
      if (err) return callback(err);

      // Convert response to a key/value pair
      var responseObj = {};
      var key = cmdBatch[count].method;
      // Remove 'get' nomenclature
      key = key.replace('get', '');
      responseObj[key] = response;
      response = responseObj;

      // Object merge
      Object.keys(response).forEach(function (key) {
        statObj[key] = response[key];
      });

      // Oh how I wish I was a generator
      if (++count === cmdBatch.length) {
        callback(err, statObj);
      }
    })
  }
}

exports.init = function (req, res) {
  var id = req.params.id;
  var command = req.params.rpc;
  console.log('received request to execute ' + command + ' command');

  req.app.db.model('Wallet').findById(id , function(err , coin){;
    var rpcClient = new bitcoin.Client({
      host: coin.host,
      port: coin.port,
      user: coin.rpcUser,
      pass: coin.rpcPassword
    });
    rpcToWallet[command](rpcClient, req.params, function (err, rpcRes) {
      if (err) {
        res.send(500, err);
      } else {
        console.log('get response from wallet RPC ');
        res.send(rpcRes);
      }
    });
  });
}