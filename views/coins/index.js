'use strict';

//var WalletRpc = require('../../wallet/rpc').WalletRpc;
//var wallet = new WalletRpc();

var coinRow = require('./coinRow');
var coinRowHeader = require('./coinRowHeader');
var fs = require('fs');
var ListView = require('../table/listView').ListView;
var jade = require('jade');

var jadeTemplate;

fs.readFile('views/coins/index.jade', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  jadeTemplate = data;
});


exports.init = function(req, res) {
  console.log("requesting coins");
  req.app.db.model('Coin').find({}, function(err , coins) {
    console.log('Found ' + coins.length);
    if (coins.length) {
      console.log('creating tableView');
      var listView = new ListView({
        rowCount: coins.length,
        htmlForHeader: function () {
          return coinRowHeader.render();
        },
        htmlForIndex: function (options) {
          return coinRow.render(coins[options.row]);
        }
      });
      console.log('sending compiled index');
      res.send(jade.compile(jadeTemplate, {filename: 'views/coins/index.jade'})({
        data: listView.data()
      }));
    }
  });


};
