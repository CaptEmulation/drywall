/**
 * Created by jdean on 2/22/14.
 */


exports.findAllCoins = function (req, res) {
  req.app.db.model('Coin').find({}, function(err , coin){
    if (!coin.length) {
      console.log('Creating new coin');
      req.app.db.model('Coin').create([{
        port: 7245,
        host: 'localhost',
        shortName: 'LBW',
        fullName: 'Leboskis'
      }], function (err, lbw) {
        if (!err) {
          console.log('Created new coin');
          res(JSON.stringify(lbw));
        } else {
          console.log('error creating new coin');
        }
      })
    } else {
      console.log('sending all coins');
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(coin));
    }

  });
};

exports.findCoinByShortName = function (req, res, next) {
  req.app.db.collection('Coins').findOne({shortName: req.params.shortName} , function(err , success){
    console.log('Response success '+success);
    console.log('Response error '+err);
    if(success){
      res.send(200 , success);
      return next();
    }
    return next(err);
  });
}
