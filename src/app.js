import { LitElement, html, css } from './components/base';
import config from './config';

import { attachRouter, urlForName } from './router';
import '@forter/checkbox';
import '@forter/button';
import '@forter/radio';

import 'pwa-helper-components/pwa-install-button.js';
import 'pwa-helper-components/pwa-update-available.js';

export class App extends LitElement {
  render() {
    return html`
      <header>
        <pwa-install-button>
          <button>Install app</button>
        </pwa-install-button>

        <pwa-update-available>
          <button>Update app</button>
        </pwa-update-available>
      </header>

      <main role="main"></main>
    `;
  }

  createRenderRoot() {
    return this;
  }

  firstUpdated() {
    attachRouter(this.querySelector('main'));
  }
}

customElements.define('app-index', App);
