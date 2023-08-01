import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyA4358XZCIyibpYuJZ1Dz4cJI-v8rtqwSA",
  authDomain: "music-radio-app-fdd06.firebaseapp.com",
  projectId: "music-radio-app-fdd06",
  storageBucket: "music-radio-app-fdd06.appspot.com",
  messagingSenderId: "1081561582610",
  appId: "1:1081561582610:web:e5e1f6d8909be163845ccb",
  measurementId: "G-JBL2DXNPB5",
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export { firebase };