/**
 * Created by jdean on 2/22/14.
 */

function (app) {
  var bitcoin = require('bitcoin');
  var mongoose = require('mongoose');
  var coins = app.db.collection('Coins');

  var lbw, requests = [];
  coins.findOne({shortName: 'LBW' } , function (err , success) {
    console.log('Response success '+success);
    console.log('Response error '+err);
    lbw = success;
    if (success && requests.length) {
      requests.forEach(function (r) {
        r(new LebowskisRequest());
      });
    }
  });

  exports.createLebowskisCoin = function (success) {
    if (lbw) {
      success(new LebowskisRequest());
    } else {
      requests.push(success);
    }
  }

  var LebowskisRequest = exports.LebowskisRequest = function (options) {
    this.lbw = options.lbw;
  };

  LebowskisRequest.prototype.getBalance = function (confirmations, resultCb) {
    this.getClient().getBalance('*', confirmations, function(err, balance) {
      if (err) return console.log(err);
      resultCb(balance);
    });
  }

  LebowskisRequest.prototype.getClient = function () {
    return this.client = this.client || new bitcoin.Client({
      host: this.lbw.host,
      port: this.lbw.port,
      user: this.lbw.rpcUser,
      pass: this.lbw.rpcPassword
    });
  }

  exports.findCoinByShortName = function (req, res, next) {
    coins.findOne({shortName: req.params.shortName} , function(err , success){
      console.log('Response success '+success);
      console.log('Response error '+err);
      if(success){
        res.send(200 , success);
        return next();
      }
      return next(err);
    });
  }

}


