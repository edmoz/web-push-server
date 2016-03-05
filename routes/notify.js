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
      var vapid = {"audience": "https://people.mozilla.org/~ewong2/push-notification-test",
                   "subject": "mailto:ewong@mozilla.com"};

      function replyWithPromise(promise) {
        promise.then(function (result) {
            reply('created').code(201);
            console.log('result:' + result);
          }).catch(function (err) {
            reply('error').code(500);
            console.log('error:'+ err);
          });
      }

      function doSend() {
        var promise;
        webpush.setGCMAPIKey(process.env.GCM_API_KEY);
        if (params.payload) {
          promise = webpush.sendNotification(params.endpoint, params.TTL, params.userPublicKey,
            new Buffer(params.payload, 'utf8'),
            vapid);
        } else {
          promise = webpush.sendNotification(params.endpoint, params.TTL);
        }
        return promise;
      }
      //flood
      if ( repeat > 1 && floodDelay > 0){
        setTimeout(function(){
          var promises = [];
          while(repeat > 0){
            console.log('flood', repeat);
            promises.push(doSend());
            repeat--;
          }
          replyWithPromise(Promise.all(promises));
        }, floodDelay);
        return;
      }

      //repeat
      if (repeat > 0 && delay > 0 && floodDelay < 1) {
        console.log('delay - count: ' + count);
        // send a notification right away
        replyWithPromise(doSend());
        console.log('delay - count: ' + count);

        if (repeat > 1) {
          var interval = setInterval(function() {
            console.log('delay - count: ' + count);
            doSend().catch(function(err) {
              console.log('delay - error: ', err);
            });
            if (count >= params.repeat - 1) {
              clearInterval(interval);
            }
            count++;
          }, delay);
        }
        return;
      }

      replyWithPromise(doSend());

    }
  }
};
