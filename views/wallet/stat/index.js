/**
 * Created by jdean on 3/10/14.
 */

'use strict';

exports.init = function(req, res) {
  console.log("requesting coin stats for " + req.params.id);
  res.render('wallet/stat/index', {
    appDef: {
      main: "views/wallet/stat/index",
      baseUrl: "../../",
      data: {
        walletId: req.params.id
      },
      walletId: req.params.id
    }
  });
};
