import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import { configStore } from '../store/ConfigStore';
import { chatStore } from '../store/ChatStore.js';
import { Input } from 'rsuite';
import Message from './message';

const chatContainerStyle = {
    position: 'relative',
    height: '100%'
}

const chatNavContainerStyle = {
    position: 'absolute',
    top: '0%',
    fontSize: '18px',
    fontWeight: '550',
    width: '94%',
    margin: '0 10px',
    paddingBottom: '10px',
    paddingTop: '10px',
    borderBottom: '1px solid'
}

const chatInputStyle = {
    position: 'absolute',
    transformOrigin: 'bottom left',
    bottom: '1%',
    left: '0%',
    width: '92%',
    margin: '10px 90px 10px 4%',
}

const textBarStyle = {
    backgroundColor: '#474C56',
    borderColor: '#474C56',
    color: 'white',
    height: '35px',
    borderRadius: '10px'
}

const messageContainer = {
    position: 'absolute',
    left: '3%',
    top: '7%',
    width: '93%',
    height: 'calc(100% - 110px)',
    overflow: 'auto'
}

const ChatRoom = observer(() => {
    const { datachannel, roomId } = useContext(configStore);
    const chatStoreInstance = useContext(chatStore);

    useEffect(() => {
        console.log('datachannel changed')
    }, [datachannel])

    const onEnterPressed = (e) => {
        if (e.keyCode === 13) {
            datachannel.send(e.target.value);
            chatStoreInstance.setSendMessage(e.target.value)
            e.target.value = ''
        }
    }

    return (
        <div style={chatContainerStyle}>
            <div style={chatNavContainerStyle}>
                Room No: #{roomId}
            </div>
            <div style={messageContainer}>
                {chatStoreInstance.messages.map((msgObj, idx) => {
                    return <Message sent={msgObj.sent} content={msgObj.content} />
                })}
            </div>
            <div style={chatInputStyle}>
                <Input
                    style={textBarStyle}
                    placeholder="type your message... "
                    onKeyDown={onEnterPressed}
                />
            </div>
        </div>
    )
})

export default ChatRoom;