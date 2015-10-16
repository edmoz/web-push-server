'use strict';

var webpush = require('web-push');

module.exports = {
  method: 'POST',
  path: '/notify',
  config: {
    handler: function (req, reply) {
      console.log('got: ' + JSON.stringify(req.payload) );
      var params = req.payload;

      webpush.sendNotification(
        params.endpoint,
        params.TTL,
        params.userPublicKey,
        params.payload
      ).then(function (result) {
        reply(result);
      }).catch(function (err) {
        reply(err);
      });
    }
  }
};
