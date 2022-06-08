import React, {useContext} from 'react';
import {Button, Avatar, Typography} from 'antd';
import styled from 'styled-components';

import {auth, db} from '../../firebase/config';
import {AuthContext} from '../../Context/AuthProvider';
import {AppContext} from '../../Context/AppProvider';
import {doc, updateDoc} from "firebase/firestore";
import {useNavigate} from "react-router-dom";
import {PhoneOutlined} from "@ant-design/icons";
import UserInfoStyle from "../ChatRoom/UserInfo.module.css"


// const WrapperStyled = styled.div`
//  display: flex;
//   justify-content: space-between;
//   padding: 12px 16px;
//   border-bottom: 1px solid rgba(82, 38, 83);
//
//   .username {
//     color: white;
//     margin-left: 5px;
//   }
// `;

export default function UserInfo() {
    const navigate = useNavigate()
    const {dataUser: {isOnline}} = React.useContext(AppContext)
    const {setVisible} = useContext(AppContext)
    const {
        user: {displayName},
    } = React.useContext(AuthContext);
    const {
        dataUser: {
            photo
        },
    } = React.useContext(AppContext)

    const {clearState} = React.useContext(AppContext);
    const {isProfileVisible, setIsProfileVisible} = React.useContext(AppContext)
    const handleProfile = () => {
        setIsProfileVisible(true)
    }
    console.log(isProfileVisible)
    console.log(photo)
    const handleSignOut = async () => {
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
            isOnline: false
        });
        await auth.signOut()
        navigate("/login")

    }
    const visibale = () => {
        setVisible(true);

    }
    return (
        <>
            <div className={UserInfoStyle['info']}>
                <Avatar src={photo}>
                    {photo ? '' : displayName?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Typography.Text className={UserInfoStyle['username']}>{displayName} </Typography.Text>
                <div className={`user_status ${isOnline ? "online" : "offline"}`}></div>
            </div>
            <Button
                // clear state in App Provider when logout
                //   clearState();
                //   auth.signOut();

                ghost
                onClick={() => {
                    clearState()
                    handleSignOut()
                }}
                className={UserInfoStyle['button_signout']}
            >

                Đăng xuất
            </Button>
            <Button className={UserInfoStyle['button']} ghost onClick={handleProfile}>Thông tin cá nhân</Button>
            <Button className={UserInfoStyle['button']} ghost onClick={() => visibale()}>VideoCall</Button>
        </>

    );
}
