import firebase from 'firebase';
// TODO: Import only required firebase deps

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: 'showface-425d0.firebaseapp.com',
  projectId: 'showface-425d0',
});

// TODO: Remove firestore
const db = firebase.firestore();
const facebookAuthProvider = new firebase.auth.FacebookAuthProvider();
const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
const auth = firebase.auth;

db.settings({
  timestampsInSnapshots: true,
});

export { db, facebookAuthProvider, googleAuthProvider, auth };
