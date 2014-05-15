/**
 * Created by jdean on 2/22/14.
 */

var bitcoin = require('bitcoin');
var wait = require('wait.for-es6');

exports.readBatch = function (req, res) {

  var id = req.params.id;
  var count = parseInt(req.query.count || 2048);
  var step = parseInt(req.query.step || 1);

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
    count = Math.min(blockCount, count);
    var rpcRequests = [], rpcResponse = [];
    for (var i = 1; i <= count; i+=step) {
      rpcRequests.push({
        method: 'getblockhash',
        params: [blockCount - count + i]
      });
    }

    // Wait-for semaphore for batch RPC
    var nextCallback, next = function (callback) {
      nextCallback = callback;
    }

    // Instead of yielding call cmd directly with batch commands
    client.cmd(rpcRequests, function (err, response) {
      // This will be called multiple times
      rpcResponse.push(response);
      // When our total responses equals requests, then we notify wait-for we are done
      if (rpcRequests.length === rpcResponse.length) {
        nextCallback(err, rpcRequests);
      }
    });

    // Yields until all responses are in
    yield [next];

    var hashes = rpcResponse;
    rpcRequests = [];
    for(i = 0; i < count / step; i++) {
      rpcRequests.push({
        method: 'getblock',
        params: [hashes[i]]
      });
    }
    rpcResponse = [];
    client.cmd(rpcRequests, function (err, response) {
      rpcResponse.push(response);
      if (rpcRequests.length === rpcResponse.length) {
        nextCallback(err, rpcRequests);
      }
    });

    yield [next];

    var data = [];
    rpcResponse.forEach(function (b) {
      data.push({
        x: blockCount - count,
        y: b.difficulty
      });
      count -= step;
    });

    res.json(data);
  };
  wait.launchFiber(generator);
}


exports.readIterative = function (req, res) {

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
