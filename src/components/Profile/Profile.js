import React, {useContext, useEffect, useState} from "react";
import profileStyle from './Profile.module.css'
import {AppContext} from "../../Context/AppProvider";
import {Button, Collapse, Form, Input, Modal, Typography} from "antd";
import IMG from "../svg/image1.jpg"
import Camera from "../svg/Camera";
import {storage,db,auth} from "../../firebase/config";
import {AuthContext} from "../../Context/AuthProvider";
import {ref,getDownloadURL,uploadBytes,deleteObject} from "firebase/storage"
import {getDoc, doc, updateDoc, setDoc} from "firebase/firestore"
import {formatRelative} from "date-fns/esm";
import {useNavigate} from "react-router-dom";
import Delete from "../svg/Delete";

// function formatDate(seconds) {
//     let formattedDate = '';
//
//     if (seconds) {
//         formattedDate = formatRelative(new Date(seconds * 1000), new Date());
//
//         formattedDate =
//             formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
//     }
//
//     return formattedDate;
// }
const Profile = () => {
    const [img,setImg] = useState('');
    const navigate = useNavigate()
    const {
        user: { uid, photoURL, displayName,email},
    } = useContext(AuthContext);
    const {dataUser,setDataUser} = useContext(AppContext)
    const {isProfileVisible, setIsProfileVisible} = useContext(AppContext);
    useEffect(() => {
        getDoc(doc(db, "users", auth.currentUser.uid)).then((docSnap) => {
            if (docSnap.exists) {
                setDataUser(docSnap.data());
            }
        });
        if (img) {
            const uploadImg = async () => {
                const imgRef = ref(
                    storage,
                    `avatar/${new Date().getTime()} - ${img.name}`
                );
                try {
                    if (dataUser.avatarPath) {
                        await deleteObject(ref(storage, dataUser.avatarPath));
                    }
                    const snap = await uploadBytes(imgRef, img);
                    const url = await getDownloadURL(ref(storage, snap.ref.fullPath));

                    await updateDoc(doc(db, "users", auth.currentUser.uid), {
                        photo: url,
                        photoURL: snap.ref.fullPath,
                    });

                    setImg("");
                } catch (err) {
                    console.log(err.message);
                }
            };
            uploadImg();
        }
    }, [img]);

    const deleteImage = async () => {
        try {
            const confirm = window.confirm("Delete avatar?");
            if (confirm) {
                await deleteObject(ref(storage, dataUser.avatarPath));

                await updateDoc(doc(db, "users", auth.currentUser.uid), {
                    photo: "",
                    photoURL: "",
                });
                navigate("/")
            }
        } catch (err) {
            console.log(err.message);
        }
    };
    const handleCancel = () => {
        setIsProfileVisible(false);
    };
    const handleOK = () =>{
        setIsProfileVisible(false)
    }
    console.log(dataUser)

    return dataUser ? (
        <div>
            <Modal
                title='Thông tin cá nhân'
                visible={isProfileVisible}
                onCancel={handleCancel}
                onOk={handleOK}
            >
                <div className={profileStyle['profile_container']}>
                    <div className={profileStyle['img_container']}>
                        <img src={dataUser.photo || IMG} alt="avatar"/>
                        <div className={profileStyle['overlay']}>
                            <div>
                                <label htmlFor="photo">
                                    <Camera/>
                                </label>
                                {dataUser.photo ? <Delete deleteImage={deleteImage} /> : null}
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    id="photo"
                                    onChange={ (e) => setImg(e.target.files[0])}
                                />

                            </div>

                        </div>
                    </div>
                    <div className={profileStyle['text_container']}>
                        <h3>{displayName}</h3>
                        <p>Email: {email}</p>
                        <hr/>
                        <p>Tài khoản:{dataUser.providerId}</p>


                    </div>
                </div>

            </Modal>
        </div>

  ) : null;
}
export default Profile
