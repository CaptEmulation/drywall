/**
 * Created by jdean on 2/26/14.
 */
'use strict';


var fs = require('fs');
var jade = require('jade');

var jadeTemplate;

fs.readFile('views/coins/coinRow.jade', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  jadeTemplate = data;
});

exports.render = function (coin) {
  var text = jade.compile(jadeTemplate)(coin);
  return text;
};
