import React, { useState, useContext, useRef } from 'react';
import { Button, IconButton, ButtonGroup, ButtonToolbar, Icon } from 'rsuite';
import { configStore } from '../store/ConfigStore';
import JoinRoom from './joinroom';
import ChatRoom from './chatroom';
import { observer } from 'mobx-react';

const sidePanelStyle = {
    height: '100%',
    backgroundColor: '#1A1D24',
    position: 'relative',
    transition: 'linear 0.25s',
    width: '30%',
    minWidth: '250px'
}

const iconButtonStyle = {
    left: '-120px',
    top: '3%',
    position: 'absolute'
}


const SidePanel = observer(() => {
    const [collapse, setCollapse] = useState(true);
    const sidePanelRef = useRef(null);
    const configStoreInstance = useContext(configStore);

    const handleClick = () => {
        setCollapse(!collapse)
    }


    return (
        <div style={{
                ...sidePanelStyle,
                marginRight: collapse ? '0%' : `-50%`
            }}
            ref={sidePanelRef}
        >
            <Button
                style={iconButtonStyle}
                color="blue" 
                appearance="default"
                onClick={handleClick}
            >
                <Icon 
                    icon={collapse ? 'angle-right' : 'angle-left'}
                    style={{paddingRight: '10px'}}
                />
                    {collapse ? 'Collapse' : 'Expand'}
            </Button>
            {configStoreInstance.connectedToRoom ? <ChatRoom />  : <JoinRoom />}
        </div>
    )
})

export default SidePanel;