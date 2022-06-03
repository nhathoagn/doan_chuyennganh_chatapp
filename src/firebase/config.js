import  firebase from 'firebase/compat/app'
import 'firebase/compat/analytics'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'
import 'firebase/compat/storage'
const firebaseConfig = {
  apiKey: "AIzaSyABeTd0yX_mWaB5YMLDqcwZ8eNWrHCqxJc",
  authDomain: "chatapp-6dafe.firebaseapp.com",

  projectId: "chatapp-6dafe",
  storageBucket: "chatapp-6dafe.appspot.com",
  messagingSenderId: "18158257076",
  appId: "1:18158257076:web:142a051902bb3ccf4928e1",
  measurementId: "G-E2N0XLVMDH"
};
firebase.initializeApp(firebaseConfig);
firebase.analytics();

const auth = firebase.auth();
const db = firebase.firestore()
const storage = firebase.storage()
// auth.useEmulator('http://localhost:9096')
// if (window.location.hostname === 'localhost'){
//     db.useEmulator('localhost','8086')
// }
export {db,auth,storage};
export default firebase