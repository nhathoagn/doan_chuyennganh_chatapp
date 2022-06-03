import { UserAddOutlined } from '@ant-design/icons';
import React, { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Button, Tooltip, Avatar, Form, Input, Alert } from 'antd';
import Message from './Message';
import { AppContext } from "../../Context/AppProvider";
import { addDocument } from "../../firebase/services";
import { AuthContext } from "../../Context/AuthProvider";
import useFirestore from "../../hooks/useFirestore";
import InputEmoji from 'react-input-emoji';
import Attachment from "../svg/Attachment";
import {ref,getDownloadURL, uploadBytes} from "firebase/storage";
import {storage} from "../../firebase/config";
const WrapperStyled = styled.div`
  height: 100vh;
`;
const ContentStyled  =styled.div`
 height: calc(100% - 56px);
 display: flex;
  flex-direction:column;
  padding: 11px;
  justify-content: flex-end;
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
const HeaderStyled = styled.div`
     display: flex;
      justify-content: space-between;
      height: 56px;
      padding: 0 16px;
      align-items: center;
      border-bottom: 1px solid rgb(230,230,230);
      .header{
        &_info{
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        &_title{
          margin: 0;
          font-weight: bold;
        }
        &_description{
          font-size: 12px;
        }
      }
    `;
const ButtonGroupStyled = styled.div`
    display: flex;
      align-items: center;
    `

const MessageListStyled = styled.div`
        max-height: 100%;
      overflow-y: auto;
    `;
export default function ChatWindow() {
  let url;
  const { selectedRoom, members, setIsInviteMemberVisible } =
      useContext(AppContext);
  const {
    user: { uid, displayName },
  } = useContext(AuthContext);
  const {dataUser:{photo}}=React.useContext(AppContext)
  const [inputValue, setInputValue] = useState('');
  const [img, setImg] = useState("");
  const [form] = Form.useForm();
  const inputRef = useRef(null);
  const messageListRef = useRef(null);



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
      photo: photo || displayName?.charAt(0)?.toUpperCase() ,
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

  const condition = React.useMemo(
      () => ({
        fieldName: 'roomId',
        operator: '==',
        compareValue: selectedRoom.id,
      }),
      [selectedRoom.id]
  );

  const messages = useFirestore('messages', condition);

  useEffect(() => {
    // scroll to bottom after message changed
    if (messageListRef?.current) {
      messageListRef.current.scrollTop =
          messageListRef.current.scrollHeight + 50;
    }
  }, [messages]);
  console.log(messages)
  return (
      <WrapperStyled>
        {selectedRoom.id ? (
            <>
              <HeaderStyled>
                <div className='header__info'>
                  <p className='header__title'>{selectedRoom.name}</p>
                  <span className='header__description'>
                {selectedRoom.description}
              </span>
                </div>
                <ButtonGroupStyled>
                  <Button
                      icon={<UserAddOutlined />}
                      type='text'
                      onClick={() => setIsInviteMemberVisible(true)}
                  >
                    Mời
                  </Button>
                  <Avatar.Group size='small' maxCount={2}>
                    {members.map((member) => (
                        <Tooltip title={member.displayName} key={member.id}>
                          <Avatar src={member.photo}>
                            {member.photo
                                ? ''
                                : member.displayName?.charAt(0)?.toUpperCase()}
                          </Avatar>
                        </Tooltip>
                    ))}
                  </Avatar.Group>
                </ButtonGroupStyled>
              </HeaderStyled>
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
                      style={{ display: "none" }}
                      id="photo"
                      onChange={ (e) => setImg(e.target.files[0])}
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
            </>
        ) : (
            <Alert
                message='Hãy chọn phòng'
                type='info'
                showIcon
                style={{ margin: 5 }}
                closable
            />
        )}
      </WrapperStyled>
  );
}