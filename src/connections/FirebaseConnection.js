import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

export default class FirebaseConnection {
    constructor () {
        const instance = this.constructor.instance;
        if (instance) {
            return instance;
        }

        const firebaseConfig = {
            apiKey: "AIzaSyAIK9x-NCJAwthC0eWqDc9Mk8sk6KkVEt0",
            authDomain: "firealert-f4e44.firebaseapp.com",
            databaseURL: "https://firealert-f4e44-default-rtdb.firebaseio.com",
            projectId: "firealert-f4e44",
            storageBucket: "firealert-f4e44.appspot.com",
            messagingSenderId: "448939303966",
            appId: "1:448939303966:web:440600e9bfbf1fb9e8ba0f"
        };
        if (firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
        }
        
        this.db = firebase.firestore();
        this.auth = firebase.auth();

        this.constructor.instance = this;
    }
}