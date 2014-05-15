'use strict';

exports = module.exports = function(app, mongoose) {
  var proxySchema = new mongoose.Schema({
    port: { type: Number, default: '' },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'StratumClient' },
    user: { type: String, default: '' },
    password: { type: String, default: '' }
  });
  app.db.model('StratumProxy', proxySchema);
};
