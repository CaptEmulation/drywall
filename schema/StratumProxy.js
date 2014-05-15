'use strict';

var Q = require('q');

exports = module.exports = function(app, mongoose) {
  var proxySchema = new mongoose.Schema({
    port: { type: Number, default: '' },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'StratumClient' },
    user: { type: String, default: '' },
    password: { type: String, default: '' }
  });

  proxySchema.method({
    toUrl: function () {
      return this.user + ':' + this.password + '@localhost:' + this.port;
    }
  });

  proxySchema.static({
    qFind: function (attributes) {
      return Q.nbind(this.find, this)(attributes);
    }
  });

  app.db.model('StratumProxy', proxySchema);
};
