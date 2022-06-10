
import React, {useEffect, useRef, useState, useContext} from "react"
import {CopyToClipboard} from "react-copy-to-clipboard"
import Peer from "simple-peer"
import io from "socket.io-client"

import VideoCallStyle from "./VideoCall.module.css"
import {AppContext} from "../../Context/AppProvider";
import {Drawer, Space, Button, Input} from "antd";
import {CopyTwoTone, PhoneTwoTone} from "@ant-design/icons";
import {IconButton} from "@mui/material";



 let socket;
console.log("đã chạy qua videocall rồi hoàng ơi")
function VideoCall()  {
    // const socket = io('http://localhost:5000')
    console.log("asdasds")
    // console.log("socket",socket.id)
    console.log("ádasd")
    // const [s,setS] = useState(socket)
    const [me, setMe] = useState("")
    const [stream, setStream] = useState()
    const [receivingCall, setReceivingCall] = useState(false)
    const [caller, setCaller] = useState("")
    const [callerSignal, setCallerSignal] = useState()
    const [callAccepted, setCallAccepted] = useState(false)
    const [idToCall, setIdToCall] = useState("")
    const [callEnded, setCallEnded] = useState(false)
    const [name, setName] = useState("")


    const onClose = () => {
        setVisible(false);
    };

    const {visible, setVisible} = useContext(AppContext);
    const myVideo = useRef()
    const userVideo = useRef()
    const connectionRef = useRef()


    useEffect( () =>{
        console.log("toang rồi hoàng ơi ")
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
                console.log("toang rồi ")
                setStream(currentStream);
                if (myVideo.current) {
                    myVideo.current.srcObject = currentStream;
                }
            })
            socket = io('http://localhost:5000');
            console.log("socket",socket.id)
            socket.on("me", (id) => {
                console.log("socsetid", id)
                setMe(id)
            })
            socket.on("callUser", (data) => {
                setReceivingCall(true)
                setCaller(data.from)
                setName(data.name)
                setCallerSignal(data.signal)
            })

        },[])


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
    const cancel = () => {
        setCallEnded(true)
        setReceivingCall(false)
    }
    console.log("dasda",me, visible, stream)

    return (
        <>
            { visible && <Drawer
                title="VideoCall"
                visible={visible}
                width={700}
                onClose={onClose}
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
                        <Input
                            placeholder="Nhập họ và tên"
                            id="filled-basic"
                            label="Name"
                            variant="filled"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{marginBottom: "20px"}}
                        />
                        <CopyToClipboard text={me} style={{marginBottom: "2rem"}}>
                            <Button variant="contained" type="primary" >
                                Copy ID
                            </Button>
                        </CopyToClipboard>
                        <Input
                            placeholder="Nhập id người gọi"
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
                                    <PhoneTwoTone  fontSize="large"/>
                                </IconButton>
                            )}

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
            </Drawer>}

        </>
    )
}

export default VideoCall
