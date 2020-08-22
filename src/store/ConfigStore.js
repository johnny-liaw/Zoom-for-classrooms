import { observable, decorate, get, set, computed, action } from 'mobx';
import { createContext } from 'react';
import io from 'socket.io-client';
import { socketConfig, pcConfig } from '../config/config'; 

class ConfigStore {
    connectedToRoom = false;
    roomId = null;
    initiator = null;
    socket = io('http://localhost:8080', socketConfig)
    pc = new RTCPeerConnection(pcConfig)
    datachannel = null;
    localVideoRef = null;
    remoteVideoRef = null;

    setRoomId(providedRoomId) {
        this.roomId = providedRoomId;
    }

    setInitiatorStatus(bool) {
        this.initiator = bool;
    }

    setLocalVideoRef(ref) {
        this.localVideoRef = ref;
    }

    setRemoteVideoRef(ref) {
        this.remoteVideoRef = ref;
    }

    setConnectedToRoomStatus(bool) {
        this.connectedToRoom = bool;
    }

    setDataChannel(channel) {
        this.datachannel = channel;
    }
}

decorate(ConfigStore, {
    connectedToRoom: observable,
    roomId: observable,
    initiator: observable,
    socket: observable,
    pc: observable,
    datachannel: observable,
    setRoomId: action,
    setInitiatorStatus: action,
    localVideoRef: observable,
    remoteVideoRef: observable,
    setLocalVideoRef: action,
    setRemoteVideoRef: action,
    setConnectedToRoomStatus: action,
})
export const configStore = createContext(new ConfigStore());