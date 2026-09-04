/*==================================================
SMARTBAZAAR PRO 2
FEATURE: ORDER SERVICE
FILE: order-service.js
==================================================*/

import {
    ref,
    get,
    update,
    query,
    orderByChild,
    equalTo,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import { database } from "./firebase-config.js";

import {
    ORDER_STATUS,
    PAYMENT_ORDER_STATUS
} from "./order-status.js";


/*==================================================
FEATURE: FIREBASE AUTH
==================================================*/

const auth =
    getAuth();


/*==================================================
FEATURE: ORDERS PATH
==================================================*/

const ORDERS_PATH =
    "orders";


/*==================================================
FEATURE: GET CURRENT USER
==================================================*/

function getCurrentUser() {

    const user =
        auth.currentUser;

    if (!user) {
        throw new Error(
            "User is not authenticated."
        );
    }

    return user;
}


/*==================================================
FEATURE: GET ORDER BY FIREBASE KEY
==================================================*/

export async function getOrder(orderKey) {

    if (!orderKey) {
        throw new Error(
            "Order key is required."
        );
    }

    const user =
        getCurrentUser();

    const orderRef =
        ref(
            database,
            `${ORDERS_PATH}/${orderKey}`
        );

    const snapshot =
        await get(orderRef);

    if (!snapshot.exists()) {
        return null;
    }

    const order =
        snapshot.val();


    /*----------------------------------------------
    CUSTOMER OWNERSHIP CHECK
    ----------------------------------------------*/

    if (
        order.userId &&
        order.userId !== user.uid
    ) {

        throw new Error(
            "You are not authorized to view this order."
        );
    }


    return {

        firebaseKey:
            orderKey,

        ...order
    };
}


/*==================================================
FEATURE: GET CURRENT USER ORDERS
==================================================*/

export async function getMyOrders() {

    const user =
        getCurrentUser();

    const ordersRef =
        ref(
            database,
            ORDERS_PATH
        );

    const ordersQuery =
        query(
            ordersRef,
            orderByChild("userId"),
            equalTo(user.uid)
        );

    const snapshot =
        await get(ordersQuery);

    if (!snapshot.exists()) {
        return [];
    }

    const data =
        snapshot.val();


    const orders =
        Object.entries(data)
            .map(
                ([key, order]) => ({
                    firebaseKey: key,
                    ...order
                })
            );


    /*----------------------------------------------
    SORT NEWEST FIRST
    ----------------------------------------------*/

    orders.sort(
        (a, b) =>
            Number(b.createdAt || 0) -
            Number(a.createdAt || 0)
    );


    return orders;
}


/*==================================================
FEATURE: GET SELLER ORDERS
==================================================*/

export async function getSellerOrders() {

    const user =
        getCurrentUser();

    const ordersRef =
        ref(
            database,
            ORDERS_PATH
        );

    const sellerQuery =
        query(
            ordersRef,
            orderByChild("sellerId"),
            equalTo(user.uid)
        );

    const snapshot =
        await get(sellerQuery);

    if (!snapshot.exists()) {
        return [];
    }

    const data =
        snapshot.val();


    const orders =
        Object.entries(data)
            .map(
                ([key, order]) => ({
                    firebaseKey: key,
                    ...order
                })
            );


    orders.sort(
        (a, b) =>
            Number(b.createdAt || 0) -
            Number(a.createdAt || 0)
    );


    return orders;
}


/*==================================================
FEATURE: UPDATE ORDER
==================================================*/

export async function updateOrder(
    orderKey,
    changes
) {

    if (!orderKey) {
        throw new Error(
            "Order key is required."
        );
    }

    if (
        !changes ||
        typeof changes !== "object"
    ) {
        throw new Error(
            "Valid order changes are required."
        );
    }


    const orderRef =
        ref(
            database,
            `${ORDERS_PATH}/${orderKey}`
        );


    await update(
        orderRef,
        {
            ...changes,

            updatedAt:
                serverTimestamp()
        }
    );


    return true;
}


/*==================================================
FEATURE: MARK ORDER PAID
==================================================

IMPORTANT:
This function must only be called by the
SECURE payment verification/backend flow.

Do NOT call this directly from customer UI
for real payments.
==================================================*/

export async function markOrderPaid(
    orderKey,
    paymentData = {}
) {

    if (!orderKey) {
        throw new Error(
            "Order key is required."
        );
    }


    const orderRef =
        ref(
            database,
            `${ORDERS_PATH}/${orderKey}`
        );


    await update(
        orderRef,
        {

            paymentStatus:
                PAYMENT_ORDER_STATUS.PAID,

            status:
                ORDER_STATUS.CONFIRMED,

            paymentId:
                paymentData.paymentId ||
                null,

            transactionId:
                paymentData.transactionId ||
                null,

            paymentVerifiedAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()
        }
    );


    return true;
}


/*==================================================
FEATURE: MARK ORDER FAILED
==================================================*/

export async function markOrderPaymentFailed(
    orderKey,
    reason = ""
) {

    if (!orderKey) {
        throw new Error(
            "Order key is required."
        );
    }


    const orderRef =
        ref(
            database,
            `${ORDERS_PATH}/${orderKey}`
        );


    await update(
        orderRef,
        {

            paymentStatus:
                PAYMENT_ORDER_STATUS.FAILED,

            status:
                ORDER_STATUS.PAYMENT_FAILED,

            paymentFailureReason:
                reason || "Payment failed.",

            updatedAt:
                serverTimestamp()
        }
    );


    return true;
}
