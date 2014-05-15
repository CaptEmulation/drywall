'use strict';

//var WalletRpc = require('../../wallet/rpc').WalletRpc;
//var wallet = new WalletRpc();

//var coinTable = require('./table/index');
var fs = require('fs');
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
  res.send(jade.compile(jadeTemplate, {filename: 'views/coins/index.jade'})());
};
