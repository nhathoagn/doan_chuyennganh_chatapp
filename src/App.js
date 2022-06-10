import './App.css';
import Login from './components/Login';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import ChatRoom from './components/ChatRoom';
import AuthProvider from './Context/AuthProvider';
import AppProvider, {AppContext} from './Context/AppProvider';
import AddRoomModal from './components/Modals/AddRoomModal';
import InviteMemberModal from './components/Modals/InviteMemberModal';
import Profile from "./components/Profile/Profile";
import VideoCall from "./components/VideoCall/VideoCall";
import {useContext, useState} from "react";

function App() {



  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route element={<Login/>} path='/login' />
            <Route element={<ChatRoom/>} path='/' />
          </Routes>

          <AddRoomModal />
          <InviteMemberModal />

        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
