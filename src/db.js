import firebase from 'firebase';

firebase.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: 'showface-425d0.firebaseapp.com',
  projectId: 'showface-425d0',
});

const db = firebase.firestore();
const provider = new firebase.auth.FacebookAuthProvider();
const auth = firebase.auth;

db.settings({
  timestampsInSnapshots: true,
});

export { db, provider, auth };
