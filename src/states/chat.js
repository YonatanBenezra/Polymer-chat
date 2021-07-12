import { LitState, stateVar } from 'lit-element-state';

class MyState extends LitState {
  static get stateVars() {
    return {
      chat: [],
      _id: null,
      qid: null
    };
  }
}

export const myState = new MyState();
