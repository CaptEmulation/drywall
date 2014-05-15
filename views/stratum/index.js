/**
 * Created by jdean on 3/22/14.
 */

'use strict';

var path = 'stratum/index';

exports.init = function(req, res) {
  res.render(path, {
    tr: {
      add: "Add",
      host: 'Host'
    },
    appDef: {
      main: "views/" + path,
      baseUrl: "../"
    }
  });
};