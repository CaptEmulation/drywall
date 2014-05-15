'use strict';

exports = module.exports = function(app, mongoose) {
  var clientSchema = new mongoose.Schema({
    host: { type: String, default: '' },
    port: { type: Number, default: '' },
    name: { type: String, default: '' },
    user: { type: String, default: '' },
    password: { type: String, default: '' }
  });
  app.db.model('StratumClient', clientSchema);
};
