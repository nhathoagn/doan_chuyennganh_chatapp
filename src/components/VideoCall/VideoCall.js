import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
import TextField from "@material-ui/core/TextField"
import AssignmentIcon from "@material-ui/icons/Assignment"
import PhoneIcon from "@material-ui/icons/Phone"
import React, {useEffect, useRef, useState, useContext} from "react"
import {CopyToClipboard} from "react-copy-to-clipboard"
import Peer from "simple-peer"
import io from "socket.io-client"

import VideoCallStyle from "./VideoCall.module.css"
import {AppContext} from "../../Context/AppProvider";
import {Drawer, Space} from "antd";

const socket = io.connect('http://localhost:5000')
console.log(socket.id)
function VideoCall() {
    const [me, setMe] = useState("")
    const [stream, setStream] = useState()
    const [receivingCall, setReceivingCall] = useState(false)
    const [caller, setCaller] = useState("")
    const [callerSignal, setCallerSignal] = useState()
    const [callAccepted, setCallAccepted] = useState(false)
    const [idToCall, setIdToCall] = useState("")
    const [callEnded, setCallEnded] = useState(false)
    const [name, setName] = useState("")
    const [placement, setPlacement] = useState('right');
    const onChange = (e) => {
        setPlacement(e.target.value);
    };

    const onClose = () => {
        setVisible(false);
    };
    const {visible, setVisible} = useContext(AppContext);
    const myVideo = useRef()
    const userVideo = useRef()
    const connectionRef = useRef()

    useEffect(() => {

        navigator.mediaDevices.getUserMedia({video: true, audio: true}).then((stream) => {
            setStream(stream)
            myVideo.current.srcObject = stream
        })


    }, [visible])

    socket.on("me", (id) => {
        setMe(id)
    })
    console.log("adsd",me)
    socket.on("callUser", (data) => {
        setReceivingCall(true)
        setCaller(data.from)
        setName(data.name)
        setCallerSignal(data.signal)
    })
    const callUser = (id) => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream
        })
        peer.on("signal", (data) => {
            socket.emit("callUser", {
                userToCall: id,
                signalData: data,
                from: me,
                name: name
            })
        })
        peer.on("stream", (stream) => {

            userVideo.current.srcObject = stream

        })
        socket.on("callAccepted", (signal) => {
            setCallAccepted(true)
            peer.signal(signal)
        })

        connectionRef.current = peer
    }

    const answerCall = () => {
        setCallAccepted(true)
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream
        })
        peer.on("signal", (data) => {
            socket.emit("answerCall", {signal: data, to: caller})
        })
        peer.on("stream", (stream) => {
            userVideo.current.srcObject = stream
        })

        peer.signal(callerSignal)
        connectionRef.current = peer
    }

    const leaveCall = () => {
        setCallEnded(true)
        connectionRef.current.destroy()
    }
    console.log(me)
    return (
        <>
            <Drawer
                title="VideoCall"

                width={700}
                onClose={onClose}
                visible={visible}
                extra={
                    <Space>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button type="primary" onClick={onClose}>
                            OK
                        </Button>
                    </Space>
                }
            >
                <div className='container-video'>
                    <div className='video-container'>
                        <div className="video">
                            {stream && <video playsInline muted ref={myVideo} autoPlay style={{width: "300px"}}/>}
                        </div>
                        <div className="video">
                            {callAccepted && !callEnded ?
                                <video playsInline ref={userVideo} autoPlay style={{width: "300px"}}/> :
                                null}
                        </div>
                    </div>
                    <div className={VideoCallStyle['myId']}>
                        <TextField
                            id="filled-basic"
                            label="Name"
                            variant="filled"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{marginBottom: "20px"}}
                        />
                        <CopyToClipboard text={me} style={{marginBottom: "2rem"}}>
                            <Button variant="contained" color="primary" startIcon={<AssignmentIcon fontSize="large"/>}>
                                Copy ID
                            </Button>
                        </CopyToClipboard>
                        <TextField
                            id="filled-basic"
                            label="ID to call"
                            variant="filled"
                            type="text"
                            value={idToCall}
                            onChange={(e) => setIdToCall(e.target.value)}
                        />
                        <div className={VideoCallStyle['call-button']}>
                            {callAccepted && !callEnded ? (
                                <Button variant="contained" color="secondary" onClick={leaveCall}>
                                    End Call
                                </Button>
                            ) : (
                                <IconButton color="primary" aria-label="call" onClick={() => callUser(idToCall)}>
                                    <PhoneIcon fontSize="large"/>
                                </IconButton>
                            )}
                            {idToCall}
                        </div>
                    </div>
                    <div>
                        {receivingCall && !callAccepted ? (
                            <div className={VideoCallStyle['caller']}>
                                <h1>{name} is calling...</h1>
                                <Button variant="contained" color="primary" onClick={answerCall}>
                                    Answer
                                </Button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </Drawer>
        </>
    )
}

export default VideoCall
