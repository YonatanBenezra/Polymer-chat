const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema(
  {
    answer: {
      type: String,
      required: true
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    date: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Answer', AnswerSchema);
