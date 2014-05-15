'use strict';


exports.init = function(req, res) {
  console.log("requesting coins");
  res.render('coins/index', {
    appDef: {
      main: "views/coins/index",
      baseUrl: "../"
    }
  });
};
