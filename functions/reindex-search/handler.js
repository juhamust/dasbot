'use strict';
var index = require('./index');

module.exports.handler = function(event, context, cb) {
  index.respond(event)
  .then(function(response){
    cb(null, response);
  })
  .catch(function(err) {
    cb(err);
  });
};
