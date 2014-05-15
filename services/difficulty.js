/**
 * Created by jdean on 2/22/14.
 */

var bitcoin = require('bitcoin');
var wait = require('wait.for-es6');


exports.read = function (req, res) {

  var id = req.params.id;
  var count = req.params.count ? req.params.count : 2048;

  var data = [];

  var generator = function *() {
    var model = req.app.db.model('Wallet');
    var wallet = yield [model.findById.bind(model), id];
    var client = new bitcoin.Client({
      host: wallet.host,
      port: wallet.port,
      user: wallet.rpcUser,
      pass: wallet.rpcPassword
    });
    var blockCount = yield [client.getBlockCount.bind(client)];
    var hash = yield [client.getBlockHash.bind(client), blockCount]
    var block;
    var dataPoints = Math.min(blockCount, count);
    for (var i = 0; i < dataPoints; i++) {
      block = yield [client.getBlock.bind(client), hash];
      data.push(block.difficulty);
      hash = block.previousblockhash;
    }
    res.json(data);
  };
  wait.launchFiber(generator);
}
