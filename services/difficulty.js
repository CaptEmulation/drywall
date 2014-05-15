/**
 * Created by jdean on 2/22/14.
 */

var bitcoin = require('bitcoin');
var wait = require('wait.for-es6');
var getHashes = require('../protocol/bitcoindHelper').getHashes;
var batchCmd = require('../protocol/bitcoindHelper').batchCmd;
var Q = require('q');

exports.readBatch = function (req, res) {

  var id = req.params.id;
  var count = parseInt(req.query.count || 2048);
  var step = parseInt(req.query.step || 1);

  var model = req.app.db.model('Wallet');
  Q.denodeify(model.findById.bind(model))(id).then(function (wallet) {
    var client = new bitcoin.Client({
      host: wallet.host,
      port: wallet.port,
      user: wallet.rpcUser,
      pass: wallet.rpcPassword
    });


    Q.denodeify(client.getBlockCount.bind(client))().then(function (blockCount) {
      count = Math.min(blockCount, count);

      Q.denodeify(getHashes)(client, count, step).then(function (hashes) {
        var rpcRequests = [];
        for(var i = 0; i < count / step; i++) {
          rpcRequests.push({
            method: 'getblock',
            params: [hashes[i]]
          });
        }
        Q.denodeify(batchCmd)(client, rpcRequests).then(function (rpcResponse) {
          var data = [];
          rpcResponse.forEach(function (b) {
            data.push({
              x: blockCount - count,
              y: b.difficulty
            });
            count -= step;
          });
          res.json(data);
        }).done();
      })
    });
  }, function (err) {
    res.send(500, e.error);
  });


//  var generator = function *() {
//    try { // Obtain wallet RPC client
//      var model = req.app.db.model('Wallet');
//      var wallet = yield [model.findById.bind(model), id];
//      var client = new bitcoin.Client({
//        host: wallet.host,
//        port: wallet.port,
//        user: wallet.rpcUser,
//        pass: wallet.rpcPassword
//      });
//    } catch (e) {
//      res.send(500, e.error);
//    }
//
//    var blockCount, rpcRequests = [], rpcResponse = [];
//    try { // Get hashes of all block necessary to chart difficulty
//      blockCount = yield [client.getBlockCount.bind(client)];
//      count = Math.min(blockCount, count);
//    } catch (e) {
//      res.send(500, e.error);
//    }
//
//    try { // Get blocks
//      var hashes = yield [getHashes, client, count, step];
//      rpcRequests = [];
//      for(var i = 0; i < count / step; i++) {
//        rpcRequests.push({
//          method: 'getblock',
//          params: [hashes[i]]
//        });
//      }
//
//      rpcResponse = yield [batchCmd, client, rpcRequests];
//
//      var data = [];
//      rpcResponse.forEach(function (b) {
//        data.push({
//          x: blockCount - count,
//          y: b.difficulty
//        });
//        count -= step;
//      });
//
//      res.json(data);
//    } catch (e) {
//      res.send(500, e.error);
//    }
//
//  };
//  wait.launchFiber(generator);
}

