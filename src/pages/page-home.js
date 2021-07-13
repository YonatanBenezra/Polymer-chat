import { html } from 'lit';
import { observeState } from 'lit-element-state';
import { Logo, Feature } from '../components';
import { urlForName } from '../router';
import { Functions } from '../helpers/functions';
import { myState } from '../states/chat';
import { ifDefined } from 'lit-html/directives/if-defined';

export class PageHome extends Functions {
  render() {
    return html`
      <div class="container">
      <div class="row">
      <div class="robo-msg">
      <!-- <div class="thought">This is a thought bubble.</div> -->
          <div class="robo-container">
          <span id=${this.animated ? 'animated' : 'curious-robo'}>
        </span>
          <div class="robo-text" >
            <h3>Botty</h3>
            <small class="green">Online</small>
          </div>
          </div>
          <div class="message-wrap" id="message-box">
            ${myState?.chat.map(
              (i) => html` <div class="media msg">
                <div class="media-body">
                  <small class="pull-right time"
                    ><i class="date"></i>${i?.date}</small
                  >
                  ${i.question &&
                  html` <small style="display: block;"
                    ><span class="question"> ${i?.question} </span>
                  </small>`}
                  ${i.answer &&
                  html` <small style="display: block;" class="answer">
                    ${i?.answer}
                  </small>`}
                </div>
              </div>`
            )}
          </div>
                  </div>
          <div class="send-wrap">
            <div class="btn-panel">
                <a
                  href=""
                  class="send-message-btn pull-right"
                  id="send-btn"
                  role="button"
                  @click="${this.sendMessage}"
                  ></a>
              </div>
              <textarea
                class="form-control send-message"
                id="textArea"
                rows="3"
                placeholder="Question? / Answer"
                .value="${this.msg}"
                .onchange="${(e) => (this.msg = e?.target?.value)}"
              ></textarea>
            </div>
          </div>
        </div>
      </div>`;
  }
}

customElements.define('page-home', PageHome);
