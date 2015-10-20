'use strict';

var webpush = require('web-push');

module.exports = {
  method: 'POST',
  path: '/notify',
  config: {
    handler: function (req, reply) {
      console.log('got: ' + JSON.stringify(req.payload) );
      var params = req.payload;
      var count = 1;

      function doSend(){
        webpush.sendNotification(
            params.endpoint,
            params.TTL,
            params.userPublicKey,
            new Buffer(params.payload, 'utf8')
          ).then(function (result) {
            reply(result);
          }).catch(function (err) {
            reply(err);
          });
      }
      // send a notification right away
      doSend();

      //repeat
      if ( params.repeat > 1){
        var interval = setInterval(function() {
          // console.log('count: '+count);
          doSend();
          if ( count >= params.repeat - 1){
              clearInterval(interval);
          }
          count++;
        }, params.delay);
      }



    }
  }
};
