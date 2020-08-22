import { observable, decorate, get, set, computed, action } from 'mobx';
import { createContext } from 'react';

class ChatStore {
    messages = [];

    setSendMessage(msg) {
        this.messages.push({sent: true, content: msg})
    }

    setReceiveMessage(msg) {
        this.messages.push({sent: false, content: msg})
    }

}

decorate(ChatStore, {
    messages: observable,
    setSendMessage: action,
    setReceiveMessage: action,
})
export const chatStore = createContext(new ChatStore());