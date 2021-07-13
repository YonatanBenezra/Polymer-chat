import { html } from 'lit';
import { observeState } from 'lit-element-state';
import { Logo, Feature } from '../components';
import { urlForName } from '../router';
import { PageElement } from './page-element';
import { myState } from '../states/chat';

const SOCKET_URL = 'http://localhost:5000';
const socket = io(SOCKET_URL);

socket.emit('join', 'chatroom');

socket.emit('get_msg', () => {});

export class Functions extends observeState(PageElement) {
  static get properties() {
    return {
      msg: { type: String },
      animated: { type: Boolean }
    };
  }
  constructor() {
    super();
    this.msg = '';
    this.input = '';
    this.animated = false;
    this.socketRemoveListener();
    this.socketAddListener();
  }

  sendMessage(e) {
    if (this.msg.includes('?')) {
      const messages = this.searchQuestion(this.msg);
      let answers = [];
      answers = messages
        .filter((i) => i.answer && i.answer)
        .map((i) => i.answer);
      if (answers.length > 0) {
        socket.emit('send_msg', { msg: this.msg, _id: myState._id });
        socket.emit('send_msg', {
          msg: answers[0],
          _id: myState._id
        });
      } else {
        socket.emit('send_msg', { msg: this.msg, _id: myState._id });
      }
    } else {
      socket.emit('send_msg', { msg: this.msg, _id: myState._id });
    }
    myState._id = null;
    this.msg = '';
    this.animated = true;
  }

  searchQuestion(question) {
    const lowercasedValue = question.toLowerCase().trim();
    const filteredData = myState.chat.filter((item) => {
      return ['question'].some(
        (key) =>
          item['question'] &&
          item['answer'] &&
          item['question'].toString().toLowerCase().includes(lowercasedValue)
      );
    });

    return filteredData;
  }

  socketRemoveListener() {
    socket.off('send_msg_success');
    socket.off('get_msg_success');
    socket.off('send_msg_err');
  }

  socketAddListener() {
    socket.on('get_msg_success', (data) => {
      myState.chat = data;
      setTimeout(function () {
        var objDiv = document.getElementById('message-box');
        objDiv.scrollTop = objDiv.scrollHeight;
      }, 1);
    });

    socket.on('send_msg_success', (data) => {
      if (data) {
        if (data._id !== myState._id) {
          if (data.qid && data.qid !== myState.qid) {
            myState.qid = data.qid;
            myState._id = data._id;
            const prev = myState.chat.filter((i) => i._id === data.qid)[0];
            const allExpt = myState.chat.filter((i) => i._id !== data.qid);
            myState.chat = [...allExpt, { ...prev, answer: data.answer }];
          } else {
            myState._id = data._id;
            myState.chat = [...myState.chat, data];
          }
        }
      }
    });

    socket.on('receive_msg', (data) => {
      if (data) {
        if (data._id !== myState._id) {
          if (data.qid && data.qid !== myState.qid) {
            myState.qid = data.qid;
            myState._id = data._id;
            const prev = myState.chat.filter((i) => i._id === data.qid)[0];
            const allExpt = myState.chat.filter((i) => i._id !== data.qid);
            myState.chat = [...allExpt, { ...prev, answer: data.answer }];
          } else {
            myState._id = data._id;
            myState.chat = [...myState.chat, data];
          }
        }
      }
    });

    socket.on('search_msg_success', (data) => {
      if (data && data.length > 0 && data[0]._id !== myState._id) {
        myState._id = data[0]._id;
        myState.chat = [...myState.chat, ...data];
      }
      setTimeout(function () {
        var objDiv = document.getElementById('message-box');
        objDiv.scrollTop = objDiv.scrollHeight;
      }, 1);
    });

    socket.on('send_msg_err', (data) => {
      alert(data.err);
    });
  }
}
