import React, { Component } from 'react';

import io from 'socket.io-client'

class App extends Component {
  constructor(props) {
    super(props)
    this.localVideoref = React.createRef()
    this.remoteVideoref = React.createRef()
    this.roomIdRef = React.createRef()
    this.socket = null
    this.candidates = []
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
      this.textref.value = JSON.stringify(sdp)
      console.log('CLIENT EVENT: receiveOffer');
      console.log(sdp);
      await this.pc.setRemoteDescription(new RTCSessionDescription(sdp))
      if(!this.initiator) this.createAnswer()
    }) 

    this.socket.on('receiveAnswer', async (sdp) => {
      this.textref.value = JSON.stringify(sdp)
      console.log('CLIENT EVENT: receiveAnswer');
      console.log(sdp);
      await this.pc.setRemoteDescription(new RTCSessionDescription(sdp))
    }) 

    this.socket.on('candidate', (payload) => {
      // console.log('Candidate received')
      this.pc.addIceCandidate(new RTCIceCandidate(payload.candidate))
    })

    this.socket.on('full', (payload) => {
      alert('room is full! try another one')
    })

    this.socket.on('roomReady', (pyaload) => {
      console.log('room is ready!')
    }) 

    this.socket.on('brokerConnection', () => {
      console.log('brokering connection')
      this.createOffer()
    }) 


    const pc_config = {
      "iceServers": [
        // {
        //   urls: 'stun:[STUN_IP]:[PORT]',
        //   'credentials': '[YOR CREDENTIALS]',
        //   'username': '[USERNAME]'
        // },
        {
          urls : 'stun:stun.l.google.com:19302'
        }
      ]
    }

    // create an instance of RTCPeerConnection
    this.pc = new RTCPeerConnection(pc_config)

    // triggered when a new candidate is returned
    this.pc.onicecandidate = (e) => {
      // send the candidates to the remote peer
      // see addCandidate below to be triggered on the remote peer
      // console.log(e)
      if (e.candidate) {
        this.sendToPeer('candidate', {
          candidate: e.candidate,
          roomId: this.state.roomId
        })
      }
    }

    // triggered when there is a change in connection state
    this.pc.oniceconnectionstatechange = (e) => {
      // console.log(e)
    }

    // triggered when a stream is added to pc, see below - this.pc.addStream(stream)
    this.pc.onaddstream = (e) => {
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

  // creates an SDP answer to an offer received from remote peer
  createAnswer = () => {
    console.log('CLIENT EVENT: createAnswer')
    console.log(this.state.roomId);
    this.pc.createAnswer({ offerToReceiveVideo: 1 })
      .then(sdp => {
        this.pc.setLocalDescription(sdp)
        console.log(sdp);
        let obj = { sdp: sdp, roomId: this.state.roomId }
        console.log(obj);
        this.sendToPeer('sendAnswer', obj)
    })
  }

  // setting remote description
  setRemoteDescription = () => {
    const desc = JSON.parse(this.textref.value)
    this.pc.setRemoteDescription(new RTCSessionDescription(desc))
  }

  // creating a room
  roomCreator = () => {
    // if no rooom id in input, means user is generating a new room
    // else, user is trying to join an existing room
    console.log(this.roomInputRef.value)
    if(this.roomInputRef.value === '') {
      console.log('hi')
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

        {/* <button onClick={this.createOffer}>Offer</button>
        <button onClick={this.createAnswer}>Answer</button> */}
        <button 
          disabled={this.state.roomId}
          onClick={this.roomCreator}
        >
          Put me in a room
        </button>
        <br />
        <textarea style={{ width: 450, height:40 }} ref={ref => { this.textref = ref }} />
      </div>
    )
  }
}

export default App;