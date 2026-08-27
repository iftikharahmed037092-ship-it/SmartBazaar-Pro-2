/*==================================================
SMARTBAZAAR PRO 2
FEATURE: FIREBASE CONFIGURATION
==================================================*/

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getAnalytics
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-analytics.js";

import {
    getDatabase
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


/*==================================================
FEATURE: FIREBASE PROJECT CONFIG
==================================================*/

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
        "1:65764731299:web:367e07eadae6baf6bb1216",

    measurementId:
        "G-9Q363TBVXP"

};


/*==================================================
FEATURE: INITIALIZE FIREBASE
==================================================*/

const app =
    initializeApp(firebaseConfig);


/*==================================================
FEATURE: ANALYTICS
==================================================*/

const analytics =
    getAnalytics(app);


/*==================================================
FEATURE: REALTIME DATABASE
==================================================*/

const database =
    getDatabase(app);


/*==================================================
FEATURE: AUTHENTICATION
==================================================*/

const auth =
    getAuth(app);


/*==================================================
FEATURE: EXPORT
==================================================*/

export {
    app,
    analytics,
    database,
    auth
};
