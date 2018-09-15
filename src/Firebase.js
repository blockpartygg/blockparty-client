import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

// initialize Firebase
let config;
if(process.env.NODE_ENV === 'production') {
  config = {
    apiKey: "AIzaSyCzbQf1GhPQE87aUOa8uuhKRsg9aALN3AY",
    authDomain: "blockparty-production.firebaseapp.com",
    databaseURL: "https://blockparty-production.firebaseio.com",
    projectId: "blockparty-production",
    storageBucket: "blockparty-production.appspot.com",
    messagingSenderId: "909323091033"
  };
}
else {
  config = {
    apiKey: "AIzaSyAUPS3JHPM3CT7yblYiP7zkKkOP2boJ4Zk",
    authDomain: "blockparty-development.firebaseapp.com",
    databaseURL: "https://blockparty-development.firebaseio.com",
    projectId: "blockparty-development",
    storageBucket: "blockparty-development.appspot.com",
    messagingSenderId: "547840170646"
  };
}
firebase.initializeApp(config);

export default firebase;