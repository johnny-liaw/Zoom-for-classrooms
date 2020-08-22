import React, { useEffect, useRef, useContext, useState } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { configStore } from '../store/ConfigStore';
import { Button } from 'rsuite';

const constr = {
    audio: false,
    video: true,
}

const Video = observer(() => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const configStoreInstance = useContext(configStore);
    const [constraints, setConstraints] = useState(constr)

    useEffect(() => {
        console.log(constraints)
        configStoreInstance.setRemoteVideoRef(remoteVideoRef);
        configStoreInstance.setLocalVideoRef(localVideoRef);
        navigator.mediaDevices.getUserMedia(constraints)
            .then(localVideoSuccess)
            .catch(localVideoFailure)
    }, [constraints])

    const localVideoSuccess = (stream) => {
        let localVideoRef = toJS(configStoreInstance.localVideoRef)
        console.log(localVideoRef)
        localVideoRef.current.srcObject = stream;
        configStoreInstance.pc.addStream(stream);
    }

    const localVideoFailure = (e) => {
        console.log(e)
    }


    return (
        <div style={{ width: '100%' }}>
            <div style={{ position: 'relative', height: '93.5vh', width: '100%', overflow: 'hidden' }}>
                <video
                    style={{
                        width: 240,
                        height: 180,
                        backgroundColor: 'black',
                        position: 'absolute',
                        transformOrigin: 'bottom left',
                        left: '25px',
                        bottom: '3%',
                        zIndex: '1310',
                    }}
                    ref={localVideoRef}
                    autoPlay>
                </video>
                <video
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'black',
                    }}
                    ref={remoteVideoRef}
                    autoPlay>
                </video>
            </div>
        </div>
    )
})

export default Video;