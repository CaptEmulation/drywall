/**
 * Created by jdean on 3/20/14.
 */

var wait = require('wait.for-es6');

/**
 * @typedef {function} RpcResonder
 * @param {*} Bitcoind client
 * @param {Array.<Object>} RPC requests
 * @param {Array} RPC response array
 */

/**
 * Batches multiple requests to bitcoind RPC (much faster).  Requires a responder method which parses individual RPC
 * responses
 *
 */
var batchCmd = exports.batchCmd = function (client, commands, responder, callback) {
  if (!callback) {
    callback = responder;
    responder = null;
  }

  var fiber = function *() {
    var rpcRequests = commands, rpcResponse = [];
    try {
      // Wait-for semaphore for batch RPC
      var done, next = function (callback) {
        done = callback;
      }
      console.log('batchCmd: 2');
      // Instead of yielding call cmd directly with batch commands
      client.cmd(rpcRequests, function (err, response) {
        if (typeof responder === 'function') {
          rpcResponse.push(responder(err, response));
        } else {
          rpcResponse.push(response);
        }

        if (rpcRequests.length === rpcResponse.length) {
          done(err, rpcResponse);
        }
      });

      // Yields until all responses are in
      yield [next];

    } catch (e) {
      callback(e);
    }
    callback(null, rpcResponse);
  }
  wait.launchFiber(fiber);
}

exports.getHashes = function (client, count, step, callback) {
  var fiber = function *() {
    var blockCount, rpcRequests = [];
    try {
      blockCount = yield [client.getBlockCount.bind(client)];
      count = Math.min(blockCount, count);
      for (var i = 1; i <= count; i+=step) {
        rpcRequests.push({
          method: 'getblockhash',
          params: [blockCount - count + i]
        });
      }
      batchCmd(client, rpcRequests, callback);

    } catch (e) {
      callback(e);
    }
  }
  wait.launchFiber(fiber);
}