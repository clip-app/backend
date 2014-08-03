var mongoose = require('mongoose');

var WordSchema = mongoose.Schema({
    topic: String,
    word: String,
    video_id: String,
    end: Number,
    start: Number
});

module.exports = mongoose.model('Word', WordSchema);