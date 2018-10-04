import firebase from 'firebase';

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: 'showface-425d0.firebaseapp.com',
  projectId: 'showface-425d0',
});

const db = firebase.firestore();
const facebookAuthProvider = new firebase.auth.FacebookAuthProvider();
const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
const auth = firebase.auth;

db.settings({
  timestampsInSnapshots: true,
});

export { db, facebookAuthProvider, googleAuthProvider, auth };
