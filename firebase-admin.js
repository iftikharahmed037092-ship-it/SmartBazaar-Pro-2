/*==================================================
SMARTBAZAAR PRO 2
BACKEND
FEATURE: FIREBASE ADMIN SDK
FEATURE: SECURE SERVER DATABASE
FEATURE: ADMIN AUTHENTICATION
==================================================*/

import {
    initializeApp,
    applicationDefault,
    getApps
} from "firebase-admin/app";

import {
    getDatabase
} from "firebase-admin/database";

import {
    getAuth
} from "firebase-admin/auth";


/*==================================================
FEATURE: FIREBASE DATABASE URL
==================================================*/

const DATABASE_URL =
    process.env.FIREBASE_DATABASE_URL ||
    "https://smart-bazaar-pro-2-default-rtdb.asia-southeast1.firebasedatabase.app";


/*==================================================
FEATURE: INITIALIZE FIREBASE ADMIN
==================================================*/

if (
    getApps().length === 0
) {

    initializeApp({

        credential:
            applicationDefault(),

        databaseURL:
            DATABASE_URL

    });

}


/*==================================================
FEATURE: ADMIN DATABASE
==================================================*/

const adminDb =
    getDatabase();


/*==================================================
FEATURE: ADMIN AUTH
==================================================*/

const adminAuth =
    getAuth();


/*==================================================
FEATURE: VERIFY FIREBASE ID TOKEN
==================================================*/

async function verifyFirebaseToken(
    idToken
) {

    if (
        !idToken ||
        typeof idToken !== "string"
    ) {

        throw new Error(
            "Firebase authentication token is required."
        );

    }


    try {

        return await adminAuth.verifyIdToken(
            idToken
        );

    }

    catch (error) {

        console.error(
            "Firebase token verification failed:",
            error
        );


        throw new Error(
            "Authentication failed."
        );

    }

}


export {

    adminDb,

    adminAuth,

    verifyFirebaseToken

};
