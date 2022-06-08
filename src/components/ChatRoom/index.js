import React, {useContext} from 'react';
import { Row, Col } from 'antd';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import VideoCall from "../VideoCall/VideoCall";
import AppProvider, {AppContext} from "../../Context/AppProvider";

export default function ChatRoom() {
  const {visible} = useContext(AppContext)
  return (
    <div>
      <Row>
        <Col span={7}>
          <Sidebar />
        </Col>
        <Col span={17}>
          {visible ?  <VideoCall/> :  <ChatWindow/> }
        </Col>
      </Row>
    </div>
  );
}
