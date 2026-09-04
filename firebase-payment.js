/*==================================================
SMARTBAZAAR PRO 2
FEATURE: FIREBASE PAYMENT SERVICE
FILE: firebase-payment.js

PURPOSE:
Central Firebase payment data service.

IMPORTANT:
Payment verification must be performed by the
secure backend before a payment is marked as PAID.
==================================================*/

import {
    ref,
    get,
    query,
    orderByChild,
    equalTo
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import { database } from "./firebase-config.js";


/*==================================================
FEATURE: FIREBASE AUTH
==================================================*/

const auth =
    getAuth();


/*==================================================
FEATURE: DATABASE PATH
==================================================*/

const PAYMENTS_PATH =
    "payments";


/*==================================================
FEATURE: PAYMENT STATUS
==================================================*/

export const FIREBASE_PAYMENT_STATUS = {

    PENDING:
        "pending",

    PROCESSING:
        "processing",

    PAID:
        "paid",

    FAILED:
        "failed",

    CANCELLED:
        "cancelled",

    REFUNDED:
        "refunded"
};


/*==================================================
FEATURE: GET CURRENT USER
==================================================*/

function getCurrentUser() {

    const user =
        auth.currentUser;

    if (!user) {

        throw new Error(
            "Please login to access payment information."
        );
    }

    return user;
}


/*==================================================
FEATURE: GET PAYMENT BY ID
==================================================*/

export async function getPayment(
    paymentId
) {

    const user =
        getCurrentUser();


    if (!paymentId) {

        throw new Error(
            "Payment ID is required."
        );
    }


    const paymentRef =
        ref(
            database,
            `${PAYMENTS_PATH}/${paymentId}`
        );


    const snapshot =
        await get(
            paymentRef
        );


    if (!snapshot.exists()) {
        return null;
    }


    const payment =
        snapshot.val();


    if (
        payment.userId &&
        payment.userId !== user.uid
    ) {

        throw new Error(
            "You are not authorized to view this payment."
        );
    }


    return {

        paymentId,

        ...payment
    };
}


/*==================================================
FEATURE: GET USER PAYMENTS
==================================================*/

export async function getUserPayments() {

    const user =
        getCurrentUser();


    const paymentsRef =
        ref(
            database,
            PAYMENTS_PATH
        );


    const paymentsQuery =
        query(

            paymentsRef,

            orderByChild(
                "userId"
            ),

            equalTo(
                user.uid
            )
        );


    const snapshot =
        await get(
            paymentsQuery
        );


    if (!snapshot.exists()) {
        return [];
    }


    const data =
        snapshot.val();


    return Object.entries(data)

        .map(
            ([key, payment]) => ({

                paymentId:
                    key,

                ...payment
            })
        )

        .sort(
            (a, b) =>
                Number(
                    b.createdAt || 0
                ) -
                Number(
                    a.createdAt || 0
                )
        );
}


/*==================================================
FEATURE: GET ORDER PAYMENT
==================================================*/

export async function getOrderPayment(
    orderId
) {

    const user =
        getCurrentUser();


    if (!orderId) {

        throw new Error(
            "Order ID is required."
        );
    }


    const paymentsRef =
        ref(
            database,
            PAYMENTS_PATH
        );


    const paymentQuery =
        query(

            paymentsRef,

            orderByChild(
                "orderId"
            ),

            equalTo(
                orderId
            )
        );


    const snapshot =
        await get(
            paymentQuery
        );


    if (!snapshot.exists()) {
        return null;
    }


    const data =
        snapshot.val();


    const payments =
        Object.entries(data)

            .map(
                ([key, payment]) => ({

                    paymentId:
                        key,

                    ...payment
                })
            )

            .filter(
                payment =>
                    payment.userId ===
                    user.uid
            );


    return payments.length
        ? payments[0]
        : null;
}


/*==================================================
FEATURE: NORMALIZE PAYMENT
==================================================*/

export function normalizeFirebasePayment(
    payment
) {

    if (!payment) {
        return null;
    }


    return {

        paymentId:
            payment.paymentId ||
            payment.id ||
            "",

        orderId:
            payment.orderId ||
            "",

        userId:
            payment.userId ||
            "",

        amount:
            Number(
                payment.amount || 0
            ),

        currency:
            payment.currency ||
            "PKR",

        paymentMethod:
            payment.paymentMethod ||
            "",

        status:
            payment.status ||
            FIREBASE_PAYMENT_STATUS.PENDING,

        transactionId:
            payment.transactionId ||
            null,

        createdAt:
            payment.createdAt ||
            null,

        updatedAt:
            payment.updatedAt ||
            null
    };
}
