import firebase from 'firebase';

firebase.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: 'https://showface-425d0.firebaseio.com/',
  projectId: 'showface-425d0',
});

var db = firebase.firestore();

db.settings({
  timestampsInSnapshots: true,
});

export default db;
