import { html } from 'lit';
import { observeState } from 'lit-element-state';
import { Logo, Feature } from '../components';
import { urlForName } from '../router';
import { PageElement } from '../helpers/page-element';
import { myState } from '../states/chat';

const SOCKET_URL = 'http://localhost:5000';
const socket = io(SOCKET_URL);

socket.emit('join', 'chatroom');

socket.emit('get_msg', () => {});

export class PageHome extends observeState(PageElement) {
  static get properties() {
    return {
      msg: { type: String },
      textAreaId: { type: String },
    };
  }
  constructor() {
    super();
    this.msg = '';
    this.socketRemoveListener();
    this.socketAddListener();
  }

  render() {
    return html` <link
        rel="stylesheet"
        href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css"
      />
      <script src="//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"></script>
      <div class="container">
      <div class="row">
      <div class="robo-msg">

        <div class="robo-container">
          <span class="curious-robo"></span>
          <div class="robo-text" >
            <h3>Botty</h3>
            <small class="green">Online</small>
          </div>
          </div>
          <div class="message-wrap col-lg-12 " id="message-box">
            ${myState.chat.map(
              (i) => html` <div class="media msg">
                <div class="media-body">
                  <small class="pull-right time"
                    ><i class="fa fa-clock-o"></i>${i.date}</small
                  >
                  ${i.question &&
                  html` <small style="display: block;"
                    ><span class="question"> ${i.question} </span>
                  </small>`}
                  ${i.answer &&
                  html` <small style="display: block;" class="answer">
                    ${i.answer}
                  </small>`}
                </div>
              </div>`
            )}
          </div>
                  </div>
          <div class="send-wrap ">
            <div class="btn-panel">
                <a
                  href=""
                  class=" col-lg-4 text-right btn   send-message-btn pull-right"
                  id="sendBtn"
                  role="button"
                  @click="${this.sendMessage}"
                  ><i class="fa fa-plus"></i> Send</a
                >
              </div>
              <textarea
                class="form-control send-message"
                id="${this.textAreaId}"
                rows="3"
                placeholder="Question/Answer..."
                .value="${this.msg}"
                .onchange="${(e) => (this.msg = e.target.value)}"
              ></textarea>
            </div>
          </div>
        </div>
      </div>`;
  }

  firstUpdated(changedProperties) {
    changedProperties.forEach((oldValue, propName) => {
      console.log(`${propName} changed. oldValue: ${oldValue}`);
    });
    const textArea = this.shadowRoot.getElementById(this.textAreaId);
    textArea.focus();
  }

  sendMessage(e) {
    if (this.msg.includes('?')) {
      const messages = this.searchQuestion(this.msg);
      let answers = [];
      answers = messages
      .filter((i) => i.answer && i.answer)
      .map((i) => i.answer);
      if (answers.length > 0) {
        socket
        .emit('send_msg', { msg: this.msg, _id: myState._id })
        socket
        .emit('send_msg', {
          msg: answers[0],
          _id: myState._id
        })
      } else {
        socket
        .emit('send_msg', { msg: this.msg, _id: myState._id })
      }
    } else {
      socket
      .emit('send_msg', { msg: this.msg, _id: myState._id })
    }
    myState._id = null;
    this.msg = '';
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
        var objDiv = document.getElementById('message-box');
        objDiv.scrollTop = objDiv.scrollHeight;
        myState.chat = data;
      });
      
      socket.on('send_msg_success', (data) => {
        var objDiv = document.getElementById('message-box');
        objDiv.scrollTop = objDiv.scrollHeight;
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
      var objDiv = document.getElementById('message-box');
      objDiv.scrollTop = objDiv.scrollHeight;
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
      console.log('search_msg_success', data);
      if (data && data.length > 0 && data[0]._id !== myState._id) {
        myState._id = data[0]._id;
        myState.chat = [...myState.chat, ...data];
      }
    });

    socket.on('send_msg_err', (data) => {
      console.log('send_msg_err', data);
      alert(data.err);
    });
  }
}

// input = document.getElementById("textArea");
// console.log('now!')
// input.addEventListener("keyup", function(event) {
//   if (event.keyCode === 13) {
//     console.log('enter')
//     event.preventDefault();
//     document.getElementById("sendBtn").click();
//   }
// });

customElements.define('page-home', PageHome);
