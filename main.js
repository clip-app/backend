var redis   = require('redis');
var assert  = require('assert');
var _       = require('underscore');
var request = require('superagent');
var xml2js  = require('xml2js');
var Youtube = require('youtube-api');
var ent     = require('ent');
var async   = require('async');

// var client = redis.createClient();

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
    xml2js.parseString(res.text, function (err, result) {
      // console.dir(result.transcript);
      var segments = _.map(result.transcript.text, function(textElement) {
        return {
          text: ent.decode(textElement._).replace('\n', ' '),
          start: Number(textElement.$.start),
          end: Number(textElement.$.start) + Number(textElement.$.dur),
          dur: Number(textElement.$.dur)
        }
      });
      console.log(segments)
      var wordMaps = _.flatten(_.map(segments, splitSegmentIntoWordMap));
      console.log(wordMaps)
    });

  });
}

function splitSegmentIntoWordMap(segment) {
  // var text = str.replace(
  var words = segment.text.split(' ');
  var avgWordDur = segment.dur / words.length;
  return _.map(words, function(word) {
    var start = segment.start + ((words.indexOf(word)) * avgWordDur);
    var end = start + avgWordDur;
    return {
      word: word,
      start: start,
      end: end
    }
  }) 
  console.log(avgWordDur);
}

getCaptionsFromVideoId('LCZ-cxfxzvk');
