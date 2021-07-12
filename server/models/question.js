const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Question', QuestionSchema);
