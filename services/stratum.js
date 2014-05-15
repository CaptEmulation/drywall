/**
 * Created by jdean on 2/22/14.
 */


var stratum = require('stratum');
var Server = stratum.Server;

exports.start = function (req, res) {
  init();
  res.send(200);
}


exports.stop = function (req, res) {
  res.send(200);
}

function init() {
  'use strict';

  var
    Stratum = require('stratum'),
    servers = {
      sha256: {
        daemons: {
          bitcoin: {
            name    : 'bitcoin',
            path    : '/Users/jdean/Development/bitcoin/src/bitcoind',
            datadir : '/Users/jdean/Development/bitcoin/data',
            user    : 'btc',
            password: 'FYjL57fLKfaChFBPh298NTxqGJJzjpYdzoBq3kFj2PTi',
            port    : 8332,
            host    : '127.0.0.1',
            args    : [
              'testnet'
            ]
          }
        },
        server : new Stratum.Server({
          settings: {
            port: 3333
          }
        })
      }
    },
    daemon;

  var setup = function(type, coin){
    coin.server.on('mining', function (req, deferred, socket){
      console.log(req);

      if (req.method === 'subscribe') {
        deferred.resolve(['b4b6693b72a50c7116db18d6497cac52', 'ae6812eb4cd7735a302a8a9dd95cf71f', '08000002', 4]);
      } else if (req.method === 'authorize') {
        console.log('Authorizing worker ' + req.params[0]);
        deferred.resolve([true]);
        deferred.promise.then(function () {
          socket.set_difficulty(['b4b6693b72a50c7116db18d6497cac52']).then(function () {
            console.log('Sent difficulty');
          }, function () {
            console.log('Failed to send difficulty');
          });

          // job_id, previous_hash, coinbase1, coinbase2, branches, block_version, nbit, ntime, clean
          // SHA256
          socket.notify([
            'bf',
            '00000000d48a84c146910cfff0c9fd37052ec4c220e083a37ec9a09964e77d2d',
            '01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff20020862062f503253482f04b8864e5008',
            '072f736c7573682f000000000100f2052a010000001976a914d23fcdf86f7e756a64a7a9688ef9903327048ed988ac00000000',
            [
              '61e90d4998b4a30d5a939e7e8b9a77d0b6abae6d30e827d00a45b57052cc6812'
            ],
            '00000002',
            'ffff001d',
            'e8dc3c50',
            false
          ]).then(function () {
            console.log('Sent work');
          }, function () {
            console.log('Failed to send work');
          });
        });
      }
    });

    coin.server.on('rpc', function (name, args, connection, deferred){
      switch (name) {
        case 'mining.block':
          var daemon = args[1];
          if (typeof coin.daemons[daemon] !== 'undefined') {
            coin.server.broadcast('notify');

          }
          deferred.resolve(['ok']);
          break;
      }
    });

    coin.server.on('mining.error', function(message){
      console.log(type + ' error: ', message);
    });

    coin.server.listen().then(function (port){
      // Start all our daemons
      for (var daemon in coin.daemons) {
        if (coin.daemons[daemon].start()) {
          (function(d){
            console.log('Starting ' + d.name);

            d.on('close', function(){
              console.log(d.name + ' process closed');
            });

            setTimeout(function(){
              d.call('getinfo').then(function(info){
                console.log(d.name + ' info: ', info);
              }, function(err){
                console.log(d.name + ' :', err);
              });
            }, 15000);
          })(coin.daemons[daemon]);
        }
      }
      console.log(type.toUpperCase() + ': ' + port);
    });
  };

  /* Create a daemon for each item in daemons */
  for(var type in {'sha256':true}) {

    for (daemon in servers[type].daemons){

      servers[type].daemons[daemon] =
        new Stratum.Daemon(servers[type].daemons[daemon]);
    }

    /* SHA256 and Scrypt coins, our miner shouldnt worry which
     type of coin is this
     */
    setup(type, servers[type]);
  }
}