import React, { useState } from 'react';
import useFirestore from '../hooks/useFirestore';
import { AuthContext } from './AuthProvider';

export const AppContext = React.createContext();

export default function AppProvider({ children }) {
  const [isAddRoomVisible, setIsAddRoomVisible] = useState(false);
  const [isInviteMemberVisible, setIsInviteMemberVisible] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [dataUser,setDataUser] = useState('')
    const [zindex, setZindex] = useState(0);
    const [visible, setVisible] = useState(false);
    const [childrenDrawer, setChildrenDrawer] = useState(false);
    const {
    user: { uid },
  } = React.useContext(AuthContext);
    const [load,setLoad] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [img, setImg] = useState("");
  const roomsCondition = React.useMemo(() => {
    return {
      fieldName: 'members',
      operator: 'array-contains',
      compareValue: uid,
    };
  }, [uid]);

  const rooms = useFirestore('rooms', roomsCondition);

  const selectedRoom = React.useMemo(
    () => rooms.find((room) => room.id === selectedRoomId) || {},
    [rooms, selectedRoomId]
  );

  const usersCondition = React.useMemo(() => {
    return {
      fieldName: 'uid',
      operator: 'in',
      compareValue: selectedRoom.members,
    };
  }, [selectedRoom.members]);

  const members = useFirestore('users', usersCondition);

    console.log(members)

    // const condition = React.useMemo(
    //     () => ({
    //         fieldName: 'roomId',
    //         operator: '==',
    //         compareValue: selectedRoom.id,
    //     }),
    //     [selectedRoom.id]
    // );

    const condition = React.useMemo(
        () => ({
            fieldName: 'roomId',
            operator: '==',
            compareValue: selectedRoom.id,
        }),
        [selectedRoom.id]
    );

    const messages = useFirestore('messages', condition);

  const clearState = () => {
    setSelectedRoomId('');
    setIsAddRoomVisible(false);
    setIsInviteMemberVisible(false);
  };
    console.log("asdsada",visible)
  return (
    <AppContext.Provider
      value={{
        rooms,
        members,
        selectedRoom,
        isAddRoomVisible,
        setIsAddRoomVisible,
        selectedRoomId,
        setSelectedRoomId,
        isInviteMemberVisible,
        setIsInviteMemberVisible,
        clearState,
          isProfileVisible,
          setIsProfileVisible,
          dataUser,
          setDataUser,
          visible,
          setVisible,
          childrenDrawer,
          setChildrenDrawer,
          load,setLoad,
          inputValue, setInputValue,
          img, setImg
          ,messages


      }}
    >
      {children}
    </AppContext.Provider>
  );
}
