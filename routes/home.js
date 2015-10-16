'use strict';

module.exports = {
  method: 'GET',
  path:'/',
  config: {
    handler: function (req, reply) {
      reply('hello world');
    }
  }
};
