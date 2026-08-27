import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getDatabase
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


const firebaseConfig = {

    apiKey:
        "AIzaSyC-hnn0DMRBLznCZTseQnN4Nq6f0SF_yis",

    authDomain:
        "smart-bazaar-pro-2.firebaseapp.com",

    projectId:
        "smart-bazaar-pro-2",

    storageBucket:
        "smart-bazaar-pro-2.firebasestorage.app",

    messagingSenderId:
        "65764731299",

    appId:
        "1:65764731299:web:367e07eadae6baf6bb1216"

};


const app =
    initializeApp(firebaseConfig);


const database =
    getDatabase(app);


const auth =
    getAuth(app);


export {
    app,
    database,
    auth
};
