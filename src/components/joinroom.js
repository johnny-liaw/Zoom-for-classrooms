import React, { useEffect, useContext, useState } from 'react';
import { Button, Divider, InputGroup, Input } from 'rsuite';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import { configStore } from '../store/ConfigStore';
import { chatStore } from '../store/ChatStore';

const headerTextStyle = {
    fontSize: '20px',
    marginTop: '50px',
    fontWeight: 'bold',
    color: '#EAEAEA',
    textAlign: 'center'
}

const joinRoomStyle = {
    display: 'flex',
    flexDirection: 'column',
}

const startRoomBtnStyle = {
    margin: '20px auto',
    marginTop: '30px',
    width: '70%',
}

const dividerStyle = {
    margin: '25px auto',
    width: '70%'
}

const roomInputGroupStyle = {
    width: '50%',
    borderColor: 'grey'
}

const inputStyle = {
    opacity: '1.0',
    backgroundColor: '#1A1D24',
    borderColor: '#1A1D24',
    color: 'white',
}

const JoinRoom = observer(() => {

    let configStoreInstance = useContext(configStore);
    let chatStoreInstance = useContext(chatStore);
    let pc = configStoreInstance.pc;
    let socket = configStoreInstance.socket;
    let datachannel = configStoreInstance.datachannel;
    const [joinRoomId, setJoinRoomId] = useState(null)

    useEffect(() => {
        pc.ondatachannel = receiveChannelCallback;
        pc.onicecandidate = (e) => {
            console.log('CLIENT EVENT: sendCandidate');
            console.log(e.candidate)
            if (e.candidate) {
                sendToPeer('sendCandidate', {
                    candidate: e.candidate,
                    roomId: configStoreInstance.roomId
                })
            }
        }
        pc.oniceconnectionstatechange = (e) => {
            console.log('CLIENT EVENT: iceConnectionChange');
            console.log(e)
        }
        pc.onaddstream = (e) => {
            console.log('CLIENT EVENT: onAddStream');
            let remoteVideoRef = toJS(configStoreInstance.remoteVideoRef);
            remoteVideoRef.current.srcObject = e.stream
        }

        socket.on('connection-success', success => {
            console.log(success)
        })
        socket.on('receiveOffer', async (sdp) => {
            console.log('CLIENT EVENT: receiveOffer');
            await pc.setRemoteDescription(new RTCSessionDescription(sdp))
            if (!configStoreInstance.initiator) createAnswer()
        })
        socket.on('receiveAnswer', async (sdp) => {
            console.log('CLIENT EVENT: receiveAnswer');
            await pc.setRemoteDescription(new RTCSessionDescription(sdp))
        })
        socket.on('receiveCandidate', (candidate) => {
            console.log('CLIENT EVENT: receiveCandidate')
            pc.addIceCandidate(new RTCIceCandidate(candidate))
        })
        socket.on('full', (payload) => {
            alert('room is full! try another one')
        })
        socket.on('roomReady', (pyaload) => {
            console.log('CLIENT EVENT: roomReady')
        })
        socket.on('brokerConnection', () => {
            console.log('CLIENT EVENT: brokerConnection')
            initDataChannel();
            createOffer()
        })

    }, [])

    const sendToPeer = (messageType, payload) => {
        socket.emit(messageType, {
            socketID: socket.id,
            payload: payload
        })
    }

    const initDataChannel = () => {
        console.log('CLIENT EVENT: initDataChannel');
        datachannel = pc.createDataChannel('dataChannel');
        console.log(datachannel);
        configStoreInstance.setDataChannel(datachannel);
        datachannel.onopen = handleDataChannelStatusChange;
        datachannel.onclose = handleDataChannelStatusChange;
        datachannel.onmessage = handleReceiveMessage;
    }

    const handleReceiveMessage = (e) => {
        console.log('CLIENT EVENT: handleReceiveMessage');
        chatStoreInstance.setReceiveMessage(e.data)
        console.log(e.data)
    }

    const handleDataChannelStatusChange = (e) => {
        console.log('CLIENT EVENT: handleDataChannelStatusChange');
        console.log(e);
    }

    const createOffer = () => {
        console.log('CLIENT EVENT: createOffer')
        console.log(configStoreInstance.roomId);
        pc.createOffer({ offerToReceiveVideo: 1 })
            .then(sdp => {
                pc.setLocalDescription(sdp)
                sendToPeer('sendOffer', {
                    sdp: sdp,
                    roomId: configStoreInstance.roomId
                })
            })
    }

    const receiveChannelCallback = (event) => {
        console.log('CLIENT EVENT: receiveChannelCallBack');
        datachannel = event.channel;
        configStoreInstance.setDataChannel(event.channel)
        datachannel.onmessage = handleReceiveMessage;
        datachannel.onopen = handleReceiveChannelStatusChange;
    }

    const handleReceiveChannelStatusChange = (e) => {
        console.log(e)
    }

    // creates an SDP answer to an offer received from remote peer
    const createAnswer = () => {
        console.log('CLIENT EVENT: createAnswer')
        console.log(configStoreInstance.roomId);
        pc.createAnswer({ offerToReceiveVideo: 1 })
            .then(sdp => {
                pc.setLocalDescription(sdp)
                let obj = { sdp: sdp, roomId: configStoreInstance.roomId }
                sendToPeer('sendAnswer', obj)
            })
    }

    const handleStartRoom = () => {
        console.log('start room');
        let roomId = Math.floor(100 + Math.random() * 900);
        configStoreInstance.setRoomId(roomId)
        configStoreInstance.setInitiatorStatus(true)
        configStoreInstance.setConnectedToRoomStatus(true)
        sendToPeer('join', configStoreInstance.roomId);
    }

    const handleJoinRoom = () => {
        configStoreInstance.setRoomId(joinRoomId)
        configStoreInstance.setInitiatorStatus(false)
        configStoreInstance.setConnectedToRoomStatus(true)
        sendToPeer('join', configStoreInstance.roomId);
    }

    return (
        <div style={joinRoomStyle}>
            <div style={headerTextStyle}>
                Join a room to begin chatting
            </div>
            <Button
                style={startRoomBtnStyle}
                size='md'
                appearance='ghost'
                color='cyan'
                onClick={handleStartRoom}
            >
                Start room
            </Button>
            <Divider style={dividerStyle}>OR</Divider>
            <div style={{display: 'flex', margin: '15px auto', width: '70%'}}>
                <InputGroup style={roomInputGroupStyle}>
                    <InputGroup.Addon style={{ backgroundColor: '#1A1D24', color: 'white' }}>#</InputGroup.Addon>
                    <Input id='roomNoInput' style={inputStyle} onChange={setJoinRoomId} placeholder='Room No.' />
                </InputGroup>
                <Button
                    style={{
                        margin: '0 10px',
                        width: '45%'
                    }}
                    size='md'
                    appearance='ghost'
                    color='cyan'
                    onClick={handleJoinRoom}
                >
                    Join room
            </Button>
            </div>
        </div>
    )
})

export default JoinRoom;