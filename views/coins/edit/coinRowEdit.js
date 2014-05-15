/**
 * Created by jdean on 2/26/14.
 */
'use strict';

var fs = require('fs');
var jade = require('jade');

var jadeTemplate;

fs.readFile('views/coins/edit/coinRowEdit.jade', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  jadeTemplate = data;
});

exports.render = function (coin) {
  return jade.compile(jadeTemplate)(coin);
};