/**
 * Created by jdean on 2/22/14.
 */

var bitcoin = require('bitcoin');

var rpcToWallet = {
  'getbalance': function (wallet, options, callback) {
    console.log('Sending getbalance RPC command');
    var confirmations = options.confirmations || 6;
    return wallet.getBalance('*', confirmations, function (err, balance) {
      if (err) return callback(console.log(err));
      return callback(err, {
        balance: balance
      });
    });
  }
}

exports.init = function (req, res) {
  var id = req.params.id;
  var command = req.params.rpc;

  req.app.db.model('Coin').findById(id , function(err , coin){
    var rpcClient = new bitcoin.Client({
      host: coin.host,
      port: coin.port,
      user: coin.rpcUser,
      pass: coin.rpcPassword
    });
    rpcToWallet[command](rpcClient, req.params, function (err, rpcRes) {
      if (err) return console.log(err);
      res.send(rpcRes);
    });
  });
}