/**
 * Created by jdean on 2/21/14.
 */


(function () {

  var request = require('request');

  /**
   *
   * @param {Object} options
   * @param {number} port
   * @param {string} [host]
   * @constructor
   */
  var RpcRequest = exports.RpcRequest = function (options) {
    this.url = 'http://' + (options.host || '127.0.0.1') + ':' + (options.port || '7245');
  };

  /**
   *
   * @param {Object} options
   * @param {string} method
   * @param {Array} args
   * @param {function} callback
   */
  RpcRequest.prototype.request = function (options, callback) {
    request.get(this.url, function (error, response, body) {
      callback(body);
    });
  };

})();