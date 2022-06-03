import React from 'react';
import { Row, Col, Button, Typography } from 'antd';
import firebase, {auth, db} from '../../firebase/config';
import {addDocument, addUser, generateKeywords} from '../../firebase/services';
import {doc, updateDoc} from "firebase/firestore";

const { Title } = Typography;

const fbProvider = new firebase.auth.FacebookAuthProvider();
const googleProvider = new firebase.auth.GoogleAuthProvider();

export default function Login() {
  const handleLogin = async (provider) => {
    const { additionalUserInfo, user } = await auth.signInWithPopup(provider);
    console.log(additionalUserInfo)
    if (additionalUserInfo?.isNewUser) {
      addUser('users',user.uid, {
        displayName: user.displayName,
        email: user.email,
        uid: user.uid,
        providerId: additionalUserInfo.providerId,
        keywords: generateKeywords(user.displayName?.toLowerCase()),
        isOnline: true,
      });
    }else {
     await updateDoc(doc(db,"users",user.uid),{
        isOnline: true
      })
    }
  };

  return (
    <div>
      <Row justify='center' style={{ height: 800 }}>
        <Col span={8}>
          <Title style={{ textAlign: 'center' }} level={3}>
            Fun Chat
          </Title>
          <Button
            style={{ width: '100%', marginBottom: 5 }}
            onClick={() => handleLogin(googleProvider)}
          >
            Đăng nhập bằng Google
          </Button>
          <Button
            style={{ width: '100%' }}
            onClick={() => handleLogin(fbProvider)}
          >
            Đăng nhập bằng Facebook
          </Button>
        </Col>
      </Row>
    </div>
  );
}
