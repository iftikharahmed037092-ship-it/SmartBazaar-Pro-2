/*==================================================
SMARTBAZAAR PRO 2
FEATURE: FIREBASE ORDER SERVICE
FILE: firebase-orders.js

PURPOSE:
Central Firebase service for customer/seller orders.

SELLER CONNECTION:
Firebase Auth UID
        ↓
sellerId
        ↓
orders
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
            "Please login to access orders."
        );
    }

    return user;
}


/*==================================================
FEATURE: GET ORDER
==================================================*/

export async function getFirebaseOrder(
    orderKey
) {

    const user =
        getCurrentUser();


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


    const snapshot =
        await get(
            orderRef
        );


    if (!snapshot.exists()) {
        return null;
    }


    const order =
        snapshot.val();


    /*----------------------------------------------
    CUSTOMER OWNERSHIP
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
FEATURE: GET CUSTOMER ORDERS
==================================================*/

export async function getCustomerOrders() {

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

            orderByChild(
                "userId"
            ),

            equalTo(
                user.uid
            )
        );


    const snapshot =
        await get(
            ordersQuery
        );


    if (!snapshot.exists()) {
        return [];
    }


    const data =
        snapshot.val();


    return Object.entries(data)

        .map(
            ([key, order]) => ({

                firebaseKey:
                    key,

                ...order
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
FEATURE: GET SELLER ORDERS
==================================================*/

export async function getSellerOrdersFromFirebase() {

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

            orderByChild(
                "sellerId"
            ),

            equalTo(
                user.uid
            )
        );


    const snapshot =
        await get(
            sellerQuery
        );


    if (!snapshot.exists()) {
        return [];
    }


    const data =
        snapshot.val();


    return Object.entries(data)

        .map(
            ([key, order]) => ({

                firebaseKey:
                    key,

                ...order
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
FEATURE: GET PAID SELLER ORDERS
==================================================*/

export async function getPaidSellerOrders() {

    const orders =
        await getSellerOrdersFromFirebase();


    return orders.filter(
        order =>
            String(
                order.paymentStatus || ""
            ).toLowerCase() === "paid"
    );
}


/*==================================================
FEATURE: NORMALIZE ORDER
==================================================*/

export function normalizeFirebaseOrder(
    order
) {

    if (!order) {
        return null;
    }


    return {

        firebaseKey:
            order.firebaseKey ||
            "",

        orderId:
            order.orderId ||
            "",

        productId:
            order.productId ||
            "",

        productName:
            order.productName ||
            "",

        sellerId:
            order.sellerId ||
            "",

        sellerName:
            order.sellerName ||
            "",

        userId:
            order.userId ||
            "",

        price:
            Number(
                order.price || 0
            ),

        quantity:
            Number(
                order.quantity || 1
            ),

        subtotal:
            Number(
                order.subtotal ||
                0
            ),

        deliveryFee:
            Number(
                order.deliveryFee ||
                0
            ),

        total:
            Number(
                order.total || 0
            ),

        paymentMethod:
            order.paymentMethod ||
            "",

        paymentStatus:
            order.paymentStatus ||
            "pending",

        status:
            order.status ||
            "pending",

        deliveryStatus:
            order.deliveryStatus ||
            "pending",

        commissionRate:
            Number(
                order.commissionRate || 0
            ),

        commissionAmount:
            Number(
                order.commissionAmount || 0
            ),

        sellerEarning:
            Number(
                order.sellerEarning || 0
            ),

        createdAt:
            order.createdAt ||
            null,

        updatedAt:
            order.updatedAt ||
            null
    };
}
