/**
 * Created by jdean on 2/26/14.
 */
'use strict';

var coinRowAddView = require('./coinRowAdd');

exports.init = function(req, res){
  res.send(coinRowAddView.render());
};
