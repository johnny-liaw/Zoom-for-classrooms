import React from 'react';

const messageContainerStyle = {
    position: 'relative',
    maxWidth: '60%',
    fontSize: '13px',
    borderRadius: '15px',
    color: 'white',
    backgroundColor: '474C56',
    padding: '5px 10px',
    marginRight: '5px'
}

const Message = ({ sent, content }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: sent ? 'flex-end' : 'flex-start',
            paddingBottom: '10px'
        }}>
            <span style={{
                ...messageContainerStyle,
                backgroundColor: sent ? '#307AFF' : '#474C56',
                wordWrap: 'break-word'
            }}>{content}</span>
        </div>

    )
}

export default Message;