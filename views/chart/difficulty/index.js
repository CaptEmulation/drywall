'use strict';


exports.init = function(req, res) {
  res.render('views/chart/difficulty/index', {
    appDef: {
      main: "views/chart/difficulty/index",
      baseUrl: "../../../",
      data: {
        walletId: req.params.id
      }
    }
  });
};
