var redis   = require('redis');
var assert  = require('assert');
var _       = require('underscore');
var request = require('superagent');
var xml2js  = require('xml2js');
var Youtube = require('youtube-api');

var client = redis.createClient();

Youtube.authenticate({
    type: 'key',
    key: 'AIzaSyAuz8nYwentOQIwSZBB6WveMa8lWgwVECw'
});

function getCaptionsFromVideoId(videoId) {
  assert(videoId);

  request
  .get('http://video.google.com/timedtext?lang=en&v=' + videoId)
  .end(function(err, res) {
    if (err) {
      console.log(err);
    }
    // console.log(res);
    xml2js.parseString(res.text, function (err, result) {
      // console.dir(result.transcript);
      var segments = _.map(result.transcript.text, function(textElement) {
        return {
          text: textElement._,
          start: Number(textElement.$.start),
          end: Number(textElement.$.start) + Number(textElement.$.dur),
          dur: Number(textElement.$.dur)
        }
      });
      console.log(segments)
    });

  });
}

getCaptionsFromVideoId('LCZ-cxfxzvk');
