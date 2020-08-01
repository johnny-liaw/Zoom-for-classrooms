import React, { Component } from 'react';
import io from 'socket.io-client'

class App extends Component {
  constructor(props) {
    super(props)
    this.localVideoref = React.createRef()
    this.remoteVideoref = React.createRef()
    this.roomIdRef = React.createRef()
    this.socket = null
    this.roomId = null
    this.initiator = false
    this.state = {
      roomId: null
    }
  }

  componentDidMount = () => {
    this.socket = io(
      '/webrtcPeer',
      {
        path: '/webrtc',
        query: {}
      }
    )

    this.socket.on('connection-success', success => {
      console.log(success)
    })

    this.socket.on('receiveOffer', async (sdp) => {
      console.log('CLIENT EVENT: receiveOffer');
      await this.pc.setRemoteDescription(new RTCSessionDescription(sdp))
      if(!this.initiator) this.createAnswer()
    }) 

    this.socket.on('receiveAnswer', async (sdp) => {
      console.log('CLIENT EVENT: receiveAnswer');
      await this.pc.setRemoteDescription(new RTCSessionDescription(sdp))
    }) 

    this.socket.on('receiveCandidate', (candidate) => {
      console.log('CLIENT EVENT: receiveCandidate')
      this.pc.addIceCandidate(new RTCIceCandidate(candidate))
    })

    this.socket.on('full', (payload) => {
      alert('room is full! try another one')
    })

    this.socket.on('roomReady', (pyaload) => {
      console.log('CLIENT EVENT: roomReady')
    }) 

    this.socket.on('brokerConnection', () => {
      console.log('CLIENT EVENT: brokerConnection')
      this.initDataChannel();
      this.createOffer()
    }) 


    const pc_config = {
      "iceServers": [
        {
          urls : 'stun:stun.l.google.com:19302'
        }
      ]
    }

    this.pc = new RTCPeerConnection(pc_config)
    this.pc.ondatachannel = this.receiveChannelCallback;


    this.pc.onicecandidate = (e) => {
      // send the candidates to the remote peer
      // see addCandidate below to be triggered on the remote peer
      console.log('CLIENT EVENT: sendCandidate');
      console.log(e.candidate)
      if (e.candidate) {
        this.sendToPeer('sendCandidate', {
          candidate: e.candidate,
          roomId: this.state.roomId
        })
      }
    }

    this.pc.oniceconnectionstatechange = (e) => {
      console.log('CLIENT EVENT: iceConnectionChange');
      console.log(e)
    }

    // triggered when a stream is added to pc, see below - this.pc.addStream(stream)
    this.pc.onaddstream = (e) => {
      console.log('CLIENT EVENT: onAddStream');
      this.remoteVideoref.current.srcObject = e.stream
    }

    // called when getUserMedia() successfully returns - see below
    const success = (stream) => {
      window.localStream = stream
      this.localVideoref.current.srcObject = stream
      this.pc.addStream(stream)
    }

    // called when getUserMedia() fails - see below
    const failure = (e) => {
      console.log('getUserMedia Error: ', e)
    }

    const constraints = {
      audio: false,
      video: true,
    }

    navigator.mediaDevices.getUserMedia(constraints)
      .then(success)
      .catch(failure)
  }

  sendToPeer = (messageType, payload) => {
    this.socket.emit(messageType, {
      socketID: this.socket.id,
      payload: payload
    })
  }

  /* ACTION METHODS FROM THE BUTTONS ON SCREEN */

  initDataChannel = () => {
    console.log('CLIENT EVENT: initDataChannel');
    this.datachannel = this.pc.createDataChannel('dataChannel');
    console.log(this.datachannel);
    this.datachannel.onopen = this.handleDataChannelStatusChange;
    this.datachannel.onclose = this.handleDataChannelStatusChange;
    this.datachannel.onmessage = this.handleReceiveMessage;
  }

  handleReceiveMessage = (e) => {
    console.log('CLIENT EVENT: handleReceiveMessage');
    console.log(e);
    console.log(JSON.parse(e.data))
  }

  handleDataChannelStatusChange = (e) => {
    console.log('CLIENT EVENT: handleDataChannelStatusChange');
    console.log(e);
  }

  createOffer = () => {
    console.log('CLIENT EVENT: createOffer')
    console.log(this.state.roomId);
    this.pc.createOffer({ offerToReceiveVideo: 1 })
      .then(sdp => {
        this.pc.setLocalDescription(sdp)
        this.sendToPeer('sendOffer', {
          sdp: sdp, 
          roomId: this.state.roomId
        })
    })
  }
s
  receiveChannelCallback = (event) => {
    console.log('CLIENT EVENT: receiveChannelCallBack');
    this.datachannel = event.channel;
    this.datachannel.onmessage = this.handleReceiveMessage;
    this.datachannel.onopen = this.handleReceiveChannelStatusChange;
  }

  handleReceiveChannelStatusChange = (e) => {
    console.log(e)
  }

  // creates an SDP answer to an offer received from remote peer
  createAnswer = () => {
    console.log('CLIENT EVENT: createAnswer')
    console.log(this.state.roomId);
    this.pc.createAnswer({ offerToReceiveVideo: 1 })
      .then(sdp => {
        this.pc.setLocalDescription(sdp)
        let obj = { sdp: sdp, roomId: this.state.roomId }
        this.sendToPeer('sendAnswer', obj)
    })
  }

  // creating a room
  roomCreator = () => {
    // if no rooom id in input, means user is generating a new room
    // else, user is trying to join an existing room
    if(this.roomInputRef.value === '') {
      let roomId = Math.floor(100 + Math.random() * 900) 
      this.initiator = true
      this.setState({
        roomId: roomId
      })
      this.roomInputRef.value = roomId
      this.sendToPeer('join', roomId)
    } else {
      this.setState({
        roomId: parseInt(this.roomInputRef.value)
      })
      this.sendToPeer('join', this.roomInputRef.value)
    }
  }
  
  sendMessage = () => {
    let content = this.textMsgRef.value
    console.log(content);
    let obj = JSON.stringify({ 'type': 'herro', 'data': content })
    console.log(obj);
    this.datachannel.send(obj);
  }

  sendData = (payload) => {
    this.datachannel.send(payload)
  }

  render() {
    return (
      <div>
        <video
          style={{
            width: 240,
            height: 240,
            margin: 5,
            backgroundColor: 'black'
          }}
          ref={ this.localVideoref }
          autoPlay>
        </video>
        <video
          style={{
            width: 240,
            height: 240,
            margin: 5,
            backgroundColor: 'black'
          }}
          ref={ this.remoteVideoref }
          autoPlay>
        </video>
        <br />

        <input placeholder='Room Id' ref={ref => { this.roomInputRef = ref }}></input>

        <button 
          disabled={this.state.roomId}
          onClick={this.roomCreator}
        >
          Put me in a room
        </button>
        <input ref={ref => { this.textMsgRef = ref }} placeholder="message to semd"></input>
        <button onClick={this.sendMessage}>Send</button>
        <br />
      </div>
    )
  }
}

export default App;