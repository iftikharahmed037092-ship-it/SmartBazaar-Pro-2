/*==================================================
SMARTBAZAAR PRO 2
FEATURE: FIREBASE CENTRAL CONFIGURATION
FIREBASE APP + REALTIME DATABASE + AUTH
==================================================*/


/*==================================================
FEATURE: FIREBASE APP IMPORT
==================================================*/

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";


/*==================================================
FEATURE: FIREBASE REALTIME DATABASE IMPORT
==================================================*/

import {
    getDatabase
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


/*==================================================
FEATURE: FIREBASE AUTH IMPORT
==================================================*/

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


/*==================================================
FEATURE: FIREBASE CONFIGURATION
==================================================*/

const firebaseConfig = {

    apiKey:
        "AIzaSyC-hnn0DMRBLznCZTseQnN4Nq6f0SF_yis",

    authDomain:
        "smart-bazaar-pro-2.firebaseapp.com",

    databaseURL:
        "https://smart-bazaar-pro-2-default-rtdb.asia-southeast1.firebasedatabase.app/",

    projectId:
        "smart-bazaar-pro-2",

    storageBucket:
        "smart-bazaar-pro-2.firebasestorage.app",

    messagingSenderId:
        "65764731299",

    appId:
        "1:65764731299:web:367e07eadae6baf6bb1216"

};


/*==================================================
FEATURE: INITIALIZE FIREBASE APP
==================================================*/

const app =
    initializeApp(
        firebaseConfig
    );


/*==================================================
FEATURE: INITIALIZE REALTIME DATABASE
==================================================*/

const database =
    getDatabase(
        app
    );


/*==================================================
FEATURE: INITIALIZE AUTHENTICATION
==================================================*/

const auth =
    getAuth(
        app
    );


/*==================================================
FEATURE: EXPORT FIREBASE SERVICES
==================================================*/

export {
    app,
    database,
    auth
};
