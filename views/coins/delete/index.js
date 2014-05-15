/**
 * Created by jdean on 2/26/14.
 */
'use strict';

var fs = require('fs');
var jade = require('jade');

var jadeTemplate;

fs.readFile('views/coins/delete/index.jade', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  jadeTemplate = data;
});

exports.init = function(req, res){
  req.app.db.model('Coin').findById(req.params.id, function(err , coin) {
    res.send(jade.compile(jadeTemplate)(coin));
  });

};
