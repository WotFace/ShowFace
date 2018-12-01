import firebase from 'firebase/app';
import 'firebase/auth';

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: 'showface-425d0.firebaseapp.com',
  projectId: 'showface-425d0',
});

const facebookAuthProvider = new firebase.auth.FacebookAuthProvider();
const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
const auth = firebase.auth;

export { facebookAuthProvider, googleAuthProvider, auth };
