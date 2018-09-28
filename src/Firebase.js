import firebase from 'firebase';
import { AsyncStorage } from 'react-native';

class Firebase {
  constructor() {}

  initialize() {
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

    this.setupAuthListener();
  }

  // Authentication

  get auth() {
    return firebase.auth();
  }

  setupAuthListener() {
    this.auth.onAuthStateChanged(user => {
      if(user) {

      }
      else {

      }
    });
  }

  get uid() {
    return (this.auth.currentUser || {}).uid;
  }

  get isAuthed() {
    return !!this.uid;
  }

  signIn(email, password, callback, error) {
    this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(() => {
      this.auth.signInWithEmailAndPassword(email, password).then(() => {
        this.setupPresence();
        this.setPlayerAccountCreated();
        callback();
      }).catch(error);
    });
  }

  signInAsGuest(name, callback, error) {
    this.auth.signInAnonymously().then(() => {
      this.database.ref('players/' + this.uid).onDisconnect().remove();
      this.database.ref('players/' + this.uid).set({ name: name });
      this.setupPresence();
      callback();
    }).catch(error);
  }

  signUp(email, password, name, callback, error) {
    this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(() => {
      this.auth.createUserWithEmailAndPassword(email, password).then(() => {
        this.database.ref('players/' + this.uid).set({ name: name, currency: 0 });
        this.setupPresence();
        this.setPlayerAccountCreated();
        callback();
      }).catch(error);
    });
  }

  signOut(callback) {
    this.auth.signOut().then(callback);
  }

  setupPresence() {
    this.database.ref('.info/connected').on('value', snapshot => {
      if(snapshot.val()) {
          this.database.ref('presence/' + this.uid).onDisconnect().remove();
          this.database.ref('presence/' + this.uid).set(true);
      }
    });
  }

  setPlayerAccountCreated = async () => {
    try {
        await AsyncStorage.setItem('playerAccountCreated', 'true');
    } catch(error) {
        console.log(error);
    }
}

  // Database

  get database() {
    return firebase.database();
  }

  get timestamp() {
    return firebase.database.ServerValue.TIMESTAMP;
  }
}

fire = new Firebase();

export default fire;