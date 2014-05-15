/**
 * Created by jdean on 2/27/14.
 */
'use strict';

var coinTable = require('./coinTable');

exports.init = function(req, res) {
  console.log("requesting coins");
  req.app.db.model('Coin').find({}, function(err , coins) {
    console.log('Found ' + coins.length);
    res.send(coinTable.render(coins));
  });


};
