import './App.css';
import Login from './components/Login';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import ChatRoom from './components/ChatRoom';
import AuthProvider from './Context/AuthProvider';
import AppProvider from './Context/AppProvider';
import AddRoomModal from './components/Modals/AddRoomModal';
import InviteMemberModal from './components/Modals/InviteMemberModal';
import Profile from "./components/Profile/Profile";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route element={<Login/>} path='/login' />
            <Route element={<ChatRoom/>} path='/' />

          </Routes>
          {/*<Profile/>*/}
          <AddRoomModal />
          <InviteMemberModal />

        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
