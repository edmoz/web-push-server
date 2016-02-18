'use strict';

module.exports = {
  method: 'GET',
  path:'/',
  config: {
    handler: function (req, reply) {
      console.log('/ - ua:' + JSON.stringify(req.headers));
      reply('hello world');
    }
  }
};
