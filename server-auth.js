/*==================================================
SMARTBAZAAR PRO 2
FEATURE: BACKEND AUTHENTICATION
FEATURE: FIREBASE ID TOKEN VERIFICATION
FEATURE: SECURE API ACCESS
==================================================*/

import {
    verifyFirebaseToken
} from "./firebase-admin.js";


/*==================================================
GET BEARER TOKEN
==================================================*/

function getBearerToken(req) {

    const authorization =
        req.headers.authorization;

    if (!authorization) {
        return null;
    }

    if (
        !authorization.startsWith("Bearer ")
    ) {
        return null;
    }

    return authorization.substring(7).trim();
}


/*==================================================
VERIFY REQUEST USER
==================================================*/

async function authenticateRequest(req) {

    const idToken =
        getBearerToken(req);

    if (!idToken) {

        const error =
            new Error(
                "Authentication token is required."
            );

        error.statusCode = 401;

        throw error;
    }


    const decodedToken =
        await verifyFirebaseToken(idToken);


    if (!decodedToken || !decodedToken.uid) {

        const error =
            new Error(
                "Invalid authentication token."
            );

        error.statusCode = 401;

        throw error;
    }


    return decodedToken;
}


/*==================================================
AUTHENTICATION MIDDLEWARE
==================================================*/

async function requireAuthentication(
    req,
    res,
    next
) {

    try {

        const user =
            await authenticateRequest(req);

        req.user = user;

        next();

    } catch (error) {

        console.error(
            "Authentication middleware error:",
            error
        );

        res.status(
            error.statusCode || 401
        ).json({

            success: false,

            message:
                error.message ||
                "Authentication failed."

        });
    }
}


/*==================================================
OPTIONAL AUTHENTICATION
==================================================*/

async function optionalAuthentication(
    req,
    res,
    next
) {

    try {

        const token =
            getBearerToken(req);

        if (token) {

            req.user =
                await verifyFirebaseToken(token);

        } else {

            req.user = null;
        }

        next();

    } catch (error) {

        req.user = null;

        next();
    }
}


/*==================================================
EXPORTS
==================================================*/

export {
    getBearerToken,
    authenticateRequest,
    requireAuthentication,
    optionalAuthentication
};
