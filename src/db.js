import firebase from 'firebase';

firebase.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: 'https://haxaton.firebaseio.com/',
  projectId: 'haxaton',
});

var db = firebase.firestore();

export default db;
