/**
 * Created by jdean on 2/26/14.
 */
'use strict';

var coinRowEditView = require('./coinRowEdit');

exports.init = function(req, res){
  req.app.db.model('Coin').findById(req.params.id, function(err , coin) {
    var dialogHtml = coinRowEditView.render(coin);
    res.send(dialogHtml);
  });
};
