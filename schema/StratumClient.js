'use strict';

var Q = require('q');

exports = module.exports = function(app, mongoose) {
  var _NAME = 'StratumClient';
  var clientSchema = new mongoose.Schema({
    host: { type: String, default: '' },
    port: { type: Number, default: '' },
    name: { type: String, default: '' },
    user: { type: String, default: '' },
    password: { type: String, default: '' }
  });
  clientSchema.method({
    toUrl: function () {
      return this.user + ':' + this.password + '@' + this.host + ':' + this.port;
    }
  });
  clientSchema.static({
    qFind: function (attributes) {
      return Q.denodeify(this.find, this)(attributes);
    }
  });
  app.db.model(_NAME, clientSchema);
};
