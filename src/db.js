import firebase from 'firebase';

firebase.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: 'https://showface-425d0.firebaseio.com/',
  projectId: 'facetron',
});

var db = firebase.firestore();

export default db;
