/**
 * Created by jdean on 2/27/14.
 */
'use strict';

var coinRow = require('./coinRow');
var fs = require('fs');
var ListView = require('../../table/listView').ListView;
var jade = require('jade');


var jadeTemplate;

fs.readFile('views/coins/table/index.jade', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  jadeTemplate = data;
});


exports.render = function (coins) {
  if (coins.length) {
    console.log('creating tableView');
    var listView = new ListView({
      rowCount: coins.length,
      htmlForIndex: function (options) {
        return coinRow.render(coins[options.row]);
      }
    });
    console.log('sending compiled index');
    return jade.compile(jadeTemplate, {filename: 'views/coins/index.jade'})({
      data: listView.data()
    });
  }
};

