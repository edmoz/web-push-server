'use strict';

var webpush = require('web-push');

module.exports = {
  method: 'POST',
  path: '/notify',
  config: {
    handler: function (req, reply) {
      // console.log('ua:' + JSON.stringify(req.headers));
      console.log('got: ' + JSON.stringify(req.payload) );

      if (!process.env.GCM_API_KEY) {
        console.error('If you want Chrome to work, you need to set the GCM_API_KEY environment variable to your GCM API key.');
      }

      var params = req.payload;
      var count = 1;
      var repeat = params.repeat || 1;
      var delay = params.delay || 15;
      var floodDelay = params.floodDelay || 0;

      function doSend(){
        var promise;
        webpush.setGCMAPIKey(process.env.GCM_API_KEY);
        if (params.payload){
          promise = webpush.sendNotification(params.endpoint, params.TTL, params.userPublicKey, new Buffer(params.payload, 'utf8'));
        }else{
          promise = webpush.sendNotification(params.endpoint, params.TTL);
        }
        promise.then(function (result) {
            console.log('result:' + result);
            return reply('created').code(201);
          }, function (err) {
            console.log('error:'+ err);
            return reply('error').code(500);
        });
      }

      //flood
      if ( repeat > 1 && floodDelay > 0){
        setTimeout(function(){
          while(repeat > 0){
            console.log('flood', repeat);
            doSend();
            repeat--;
          }
        }, floodDelay);
      }

      //repeat
      if ( repeat > 0 && delay > 0 && floodDelay < 1){
        console.log('delay - count: '+count);
        // send a notification right away
        doSend();

        // if there's more than 2 notifications to send
        if (repeat >= 2){
          var interval = setInterval(function() {
            console.log('delay - count: '+count);
            doSend();
            if ( count >= params.repeat - 1){
                clearInterval(interval);
            }
            count++;
          }, delay);
        }
      }



    }
  }
};
