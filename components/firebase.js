import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyDeXNgC6mU5FlCxelgY_oyRW_0Ui8Ni5rE",
  authDomain: "goparking-3f59c.firebaseapp.com",
  databaseURL: "https://goparking-3f59c-default-rtdb.firebaseio.com",
  projectId: "goparking-3f59c",
  storageBucket: "goparking-3f59c.appspot.com",
  messagingSenderId: "1025991523990",
  appId: "1:1025991523990:web:e35e2e5fc41439a819ccb7"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export { firebase };