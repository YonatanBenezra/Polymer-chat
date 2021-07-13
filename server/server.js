const app = require('express')();
const cors = require('cors');
const mongoose = require('mongoose');
const socketio = require('socket.io');
const server = require('http').createServer(app);
const moment = require('moment');
const QuestionModel = require('./models/question');
const AnswerModel = require('./models/answer');
const {
  Types: { ObjectId }
} = require('mongoose');

app.use(cors());

const connect = mongoose.connect(
  'mongodb+srv://yonatan:forForter@chatbot.rfzcn.mongodb.net/chat?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  }
);

connect.then(
  (db) => {
    console.log('***DB Connected!***');
  },
  (err) => {
    console.log(err);
  }
);

//SOCKET INIT
const io = socketio(server, { cors: { origin: '*' } });
io.on('connection', async (socket) => {
  console.log('someone joined!');
  socket.on('join', socket.join);
  socket.on('send_msg', async (data, err) => {
    console.log(data);
    let save;
    let saveAns;

    const { msg, _id } = data;

    if (!msg || typeof msg !== 'string')
      return socket.emit('send_msg_err', {
        err: 'Fields cannot be left empty!'
      });

    if (msg.includes('?')) {
      let answers = [];
      let search;
      const userRegex = new RegExp(msg.split('?')[0].trim(), 'i');
      try {
        search = await QuestionModel.exists({
          question: userRegex
        });
      } catch (error) {}

      if (search) {
        search = await QuestionModel.find({
          question: userRegex
        });
        for (let i = 0; i < search.length; i++) {
          try {
            const s = await AnswerModel.aggregate([
              { $match: { question: ObjectId(search[i]._id) } },
              {
                $lookup: {
                  from: 'questions',
                  localField: 'question',
                  foreignField: '_id',
                  as: 'question'
                }
              },
              { $unwind: '$question' },
              { $sort: { createdAt: 1 } },
              {
                $project: {
                  question: msg,
                  answer: 1,
                  date: 1
                }
              }
            ]);
            answers = [...answers, ...s];
          } catch (error) {}
        }
        return socket.emit('search_msg_success', answers);
      }

      try {
        save = await QuestionModel.create({ question: msg });
      } catch (error) {
        return socket.emit('send_msg_err', {
          err: 'Error while saving message in DB'
        });
      }

      socket.emit('send_msg_success', save);

      socket.to('chatroom').emit('receive_msg', save);
    } else {
      if (!_id) return;

      try {
        saveAns = await AnswerModel.create({
          answer: msg,
          question: ObjectId(_id),
          date: moment().format('DD-MMM-YYYY hh:mm')
        });
      } catch (error) {
        return socket.emit('send_msg_err', {
          err: 'Error while saving message in DB'
        });
      }

      const { question: qid, ...filt } = saveAns._doc;
      console.log('send_msg_success-answer', { ...filt, qid });
      socket.emit('send_msg_success', { ...filt, qid });

      socket.to('chatroom').emit('receive_msg', { ...filt, qid });
    }
  });
  socket.on('get_msg', async () => {
    let msgs;
    try {
      msgs = await AnswerModel.aggregate([
        {
          $lookup: {
            from: 'questions',
            localField: 'question',
            foreignField: '_id',
            as: 'question'
          }
        },
        { $unwind: '$question' },
        { $sort: { createdAt: 1 } },
        {
          $project: {
            question: '$question.question',
            answer: 1,
            date: 1
          }
        }
      ]);
    } catch (error) {
      return socket.emit('get_msg_err', {
        err: 'Error while reading messages from database'
      });
    }

    socket.emit('get_msg_success', msgs);
  });
});

server.listen(5000 || process.env.PORT, (err) => {
  if (err) console.log(err);
  else console.log(`server running on port ${5000 || process.env.PORT}`);
});
