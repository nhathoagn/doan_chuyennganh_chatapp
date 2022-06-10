import React, {useEffect, useRef, useState, useContext} from "react"
import {CopyToClipboard} from "react-copy-to-clipboard"
import Peer from "simple-peer"
import io from "socket.io-client"
import InputEmoji from 'react-input-emoji';
import VideoCallStyle from "./VideoCall.module.css"
import {AppContext} from "../../Context/AppProvider";
import {Drawer, Space, Button, Input, Form} from "antd";
import {CopyTwoTone, PhoneTwoTone} from "@ant-design/icons";
import {IconButton} from "@mui/material";
import Message from "../ChatRoom/Message";
import Attachment from "../svg/Attachment";
import styled from "styled-components";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {storage} from "../../firebase/config";
import {addDocument} from "../../firebase/services";
import {AuthContext} from "../../Context/AuthProvider";
import useFirestore from "../../hooks/useFirestore";

const ContentStyled = styled.div`
 height: calc(100% - 56px);
 display: flex;
  flex-direction:column;
  padding: 11px;
  justify-content: flex-end;
`;
const MessageListStyled = styled.div`
        max-height: 100%;
      overflow-y: auto;
    `;

const FormStyled = styled(Form)`
 display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 2px 2px 0px;
   
 
  .ant-form-item{
    flex: 1;
    margin-bottom: 0;
  }
`;


let socket;
console.log("đã chạy qua videocall rồi hoàng ơi")

function VideoCall() {
    const {messages} = useContext(AppContext);
    const onClose = () => {
        setVisible(false);
    };


    useEffect(() => {
        // scroll to bottom after message changed
        if (messageListRef?.current) {
            messageListRef.current.scrollTop =
                messageListRef.current.scrollHeight + 50;
        }
    }, [messages]);
    const [me, setMe] = useState("")
    const [stream, setStream] = useState()
    const [receivingCall, setReceivingCall] = useState(false)
    const [caller, setCaller] = useState("")
    const [callerSignal, setCallerSignal] = useState()
    const [callAccepted, setCallAccepted] = useState(false)
    const [idToCall, setIdToCall] = useState("")
    const [callEnded, setCallEnded] = useState(false)
    const [name, setName] = useState("")


    const {visible, setVisible} = useContext(AppContext);
    const myVideo = useRef()
    const userVideo = useRef()
    const connectionRef = useRef()
    const {inputValue, setInputValue, img, setImg} = useContext(AppContext);
    const [form] = Form.useForm();
    const {
        user: {uid, displayName},
    } = useContext(AuthContext);
    const {dataUser: {photo}} = React.useContext(AppContext)
    let url;
    const inputRef = useRef(null);
    const messageListRef = useRef(null);
    const {selectedRoom} =
        useContext(AppContext);
    useEffect(() => {
        console.log("toang rồi hoàng ơi ")
        navigator.mediaDevices.getUserMedia({video: true, audio: true}).then((currentStream) => {
            console.log("toang rồi ")
            setStream(currentStream);
            if (myVideo.current) {
                myVideo.current.srcObject = currentStream;
            }
        })
        socket = io('http://localhost:5000');
        console.log("socket", socket.id)
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
    }, [])


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
        // setCallEnded(true)
        setReceivingCall(false)
    }
    console.log("dasda", me, visible, stream)
    const handleOnSubmit = async () => {

        if (img) {
            const imgRef = ref(storage, `images/${new Date().getTime()} - ${img.name}`
            );
            const snap = await uploadBytes(imgRef, img);
            const dlUrl = await getDownloadURL(ref(storage, snap.ref.fullPath));
            url = dlUrl;
        }
        addDocument('messages', {
            text: inputValue,
            media: url || " ",
            uid,
            photo: photo || displayName?.charAt(0)?.toUpperCase(),
            roomId: selectedRoom.id,
            displayName,
        });

        form.resetFields(['message']);

        // focus to input again after submit
        if (inputRef?.current) {
            setTimeout(() => {
                inputRef.current.focus();
            });
        }
    };
    return (
        <>
            <Drawer
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
                            <Button variant="contained" type="primary">
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
                                    <PhoneTwoTone fontSize="large"/>
                                </IconButton>
                            )}

                        </div>
                    </div>
                    <div>
                        {receivingCall && !callAccepted ? (
                            <div className={VideoCallStyle['caller']}>
                                <h1>{name} is calling...</h1>
                                <Space>
                                    <Button variant="contained" type="primary" onClick={answerCall}>
                                        Answer
                                    </Button>

                                    <Button variant="contained" type="danger" onClick={cancel}>
                                        Cancel
                                    </Button>
                                </Space>
                            </div>

                        ) : null}
                    </div>
                    <div className={VideoCallStyle['scroll']}>
                        <ContentStyled>
                            <MessageListStyled ref={messageListRef}>
                                {messages.map((mes) => (

                                    <Message
                                        key={mes.id}
                                        text={mes.text}
                                        photo={mes.photo}
                                        media={mes.media}
                                        displayName={mes.displayName}
                                        createdAt={mes.createdAt}
                                    />

                                ))}
                            </MessageListStyled>
                            <FormStyled form={form}>
                                <label htmlFor="photo">
                                    <Attachment/>
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{display: "none"}}
                                    id="photo"
                                    onChange={(e) => setImg(e.target.files[0])}
                                />
                                <Form.Item name='message'>

                                    <InputEmoji

                                        // ref={inputRef}
                                        // onChange={handleInputChange}
                                        // onPressEnter={handleOnSubmit}
                                        // placeholder='Nhập tin nhắn...'
                                        // bordered={false}
                                        // autoComplete='off'
                                        // value={inputValue}
                                        value={inputValue}
                                        onChange={setInputValue}
                                        cleanOnEnter
                                        placeholder='Nhập tin nhắn...'
                                        onEnter={handleOnSubmit}

                                    />

                                </Form.Item>
                                <Button type='primary' onClick={handleOnSubmit}>
                                    Gửi
                                </Button>
                            </FormStyled>


                        </ContentStyled>
                    </div>
                </div>
            </Drawer>

        </>
    )
}

export default VideoCall
