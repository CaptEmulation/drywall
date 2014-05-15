/**
 * Created by jdean on 3/10/14.
 */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var Backbone = require('backbone');
  var RpcModel = Backbone.Model.extend();



  exports.walletConnect = function (id) {

    var rpcRoot = window.app.baseUrl + 'sl/wallet/' + id + '/';

    var rpc = {
      balanceModel: function () {
        var model = new RpcModel(null, {
          defaults: {
            balance: 0
          }
        });
        model.url = rpcRoot + 'getbalance';
        return model;
      },
      statModel: function () {
        var model = new RpcModel(null, {
          defaults: {
            balance: 0,
            difficulty: 0,
            blockcount: 0
          }
        });
        model.url = rpcRoot + 'stat';
        return model;
      }
    };

    return rpc;
  }
});

