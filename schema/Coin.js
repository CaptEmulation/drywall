'use strict';

exports = module.exports = function(app, mongoose) {
  var coinSchema = new mongoose.Schema({
    port: { type: Number, default: 8336 },
    host: { type: String, default: 'localhost' },
    fullName: { type: String, default: '' },
    shortName: { type: String, default: '' },
    rpcUser: { type: String, default: '' },
    rpcPassword: { type: String, default: '' },
  });
  app.db.model('Coin', coinSchema);
};
