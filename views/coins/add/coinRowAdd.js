/**
 * Created by jdean on 2/26/14.
 */
'use strict';

var fs = require('fs');
var jade = require('jade');

var jadeTemplate;

fs.readFile('views/coins/add/coinRowAdd.jade', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  jadeTemplate = data;
});

exports.render = function () {
  return jade.compile(jadeTemplate)();
};