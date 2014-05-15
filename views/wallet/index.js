'use strict';

exports.init = function(req, res) {
  console.log("requesting coins");
  res.render('wallet/index', {
    appDef: {
      main: "views/wallet/index",
      baseUrl: "../"
    }
  });
};
