'use strict';

var webpush = require('web-push');

module.exports = {
  method: 'POST',
  path: '/notify',
  config: {
    handler: function (req, reply) {
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
