var mongoose = require('mongoose');
var assert   = require('assert');
var _        = require('underscore');
var request  = require('superagent');
var xml2js   = require('xml2js');
var Youtube  = require('youtube-api');
var ent      = require('ent');
var async    = require('async');
var uuid     = require('node-uuid');
var md5      = require('MD5');

var Word     = require('./word');

mongoose.connect("mongodb://plato.hackedu.us:27017", function () {
  console.log("connected to mongodb", arguments);
});

Youtube.authenticate({
    type: 'key',
    key: 'AIzaSyAuz8nYwentOQIwSZBB6WveMa8lWgwVECw'
});

function getCaptionsFromVideoId(videoId, callback) {
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

        var text = ent.decode(textElement._).replace('\n', ' ');
        if (text.indexOf(':') !== -1) {
          console.log('THOUGHT SPEAKER!!! (V)');
          console.log(textElement.$);
          text = text.split(':')[1].trim();
          console.log([text]);
        }

        // function remove
        if (text.indexOf('(') !== -1 || text.indexOf(')') !== -1 ||
           text.indexOf('[') !== -1 || text.indexOf(']') !== -1) {
          console.log("CRAP DETECTED!!! Skipping... (V)");
          console.log([text]);
          return null;

      }
        return {
          text: text,
          start: Number(textElement.$.start),
          end: Number(textElement.$.start) + Number(textElement.$.dur),
          dur: Number(textElement.$.dur)
        }
      });
      segments = _.without(segments, null); // Remove skipped segments
      // console.log(segments)
      var wordMaps = _.flatten(_.map(segments, splitSegmentIntoWordMap));
      // var wordMaps = _.map(segments, splitSegmentIntoWordMap);
      // console.log(JSON.stringify(wordMaps))
      callback(null, wordMaps);
    });
  });
}

var index = 0;
function splitSegmentIntoWordMap(segment) {
  // var text = str.replace(
  var words = segment.text.split(' ');
  var avgWordDur = segment.dur / words.length;
  var avgCharDur = segment.dur / segment.text.length;
  // words with less characters take less time to say
  // [i used to massively open small microscopes ]
  // 0.00 - 5.60
  // 0.80 per word
  // 7 words
  // 36 characters
  // 0.156 per character
  // used = 4 * 0.156 = 0.624
  // massively = 11*0.156

  return _.map(words, function(word) {
    var start_word = segment.start + ((words.indexOf(word)) * avgWordDur);
    // var start_char = segment.start + (word.length * avgWordDur);
    var start_char = segment.start + (segment.text.indexOf(word) * avgCharDur);
    var end_word = start_char + avgWordDur;
    // var end_char = start_char + avgWordDur;

    return {
      word: word,
      id: ++index,
      video_id: process.argv[2],
      // start_word: Number(start_word.toFixed(3)),
      end: Number(end_word.toFixed(3)),
      // start_char: Number(start_char.toFixed(3)),
      start: Number(start_char.toFixed(3)),
      // end_char: end_char
    }
  }) 
  console.log(avgWordDur);
}

assert(process.argv[2], 'expected argv[2] (YouTube Video ID')
 //console.log(process.argv)

getCaptionsFromVideoId(process.argv[2], function (err, captions) {
  _.each(captions, function(caption) {
    if (!caption.word) return;
    // console.log(caption);
    var word = new Word({
      topic: 'hilary',
      word: caption.word,
      video_id: caption.video_id,
      end: caption.end,
      start: caption.start
    });

    // console.log(word);

    word.save(function (err) {
      if (err) {
        console.log(caption);
        console.log(err);
        console.log("ERR!!!!!");
      }
      console.log(arguments);
    });

  });
});
