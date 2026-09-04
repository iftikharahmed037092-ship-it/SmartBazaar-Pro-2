/*==================================================
SMARTBAZAAR PRO 2
FEATURE: ORDER CREATION SYSTEM
FILE: order-create.js

PURPOSE:
Create secure pending orders before payment verification.

IMPORTANT:
Online payment orders MUST NOT be marked as PAID here.
Payment verification is handled separately.
==================================================*/

import {
    ref,
    push,
    set,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import { database } from "./firebase-config.js";

import {
    validateOrderData
} from "./order-validation.js";

import {
    ORDER_STATUS,
    PAYMENT_ORDER_STATUS
} from "./order-status.js";


/*==================================================
FEATURE: FIREBASE AUTHENTICATION
==================================================*/

const auth = getAuth();


/*==================================================
FEATURE: ORDERS DATABASE PATH
==================================================*/

const ORDERS_PATH = "orders";


/*==================================================
FEATURE: CREATE ORDER ID
==================================================*/

function createOrderReference() {

    const time =
        Date.now().toString(36).toUpperCase();

    const random =
        Math.random()
            .toString(36)
            .substring(2, 7)
            .toUpperCase();

    return `SB-${time}-${random}`;
}


/*==================================================
FEATURE: GET CURRENT USER
==================================================*/

function getCurrentUser() {

    const user = auth.currentUser;

    if (!user) {
        throw new Error(
            "Please login before placing an order."
        );
    }

    return user;
}


/*==================================================
FEATURE: CREATE PENDING ORDER
==================================================*/

export async function createPendingOrder(orderData) {

    const user =
        getCurrentUser();


    /*----------------------------------------------
    VALIDATE ORDER
    ----------------------------------------------*/

    const validation =
        validateOrderData(orderData);

    if (!validation.valid) {

        throw new Error(
            validation.message
        );
    }


    /*----------------------------------------------
    CREATE FIREBASE ORDER KEY
    ----------------------------------------------*/

    const ordersRef =
        ref(
            database,
            ORDERS_PATH
        );

    const newOrderRef =
        push(ordersRef);


    /*----------------------------------------------
    CREATE PUBLIC ORDER REFERENCE
    ----------------------------------------------*/

    const orderId =
        createOrderReference();


    /*----------------------------------------------
    NORMALIZE VALUES
    ----------------------------------------------*/

    const quantity =
        Number(orderData.quantity || 1);

    const price =
        Number(orderData.price || 0);

    const total =
        Number(
            orderData.total ||
            price * quantity
        );


    /*----------------------------------------------
    SELLER INFORMATION
    ----------------------------------------------*/

    const sellerId =
        orderData.sellerId ||
        orderData.createdBy ||
        null;


    /*----------------------------------------------
    ORDER DATA
    ----------------------------------------------*/

    const newOrder = {

        id:
            newOrderRef.key,

        orderId,

        userId:
            user.uid,

        customerId:
            user.uid,

        customerEmail:
            user.email || "",


        /* PRODUCT */

        productId:
            orderData.productId,

        productName:
            orderData.productName || "",

        productImage:
            orderData.productImage || "",

        productCategory:
            orderData.productCategory || "",


        /* SELLER */

        sellerId,

        sellerName:
            orderData.sellerName || "",


        /* PRICING */

        price,

        quantity,

        subtotal:
            Number(
                orderData.subtotal ||
                price * quantity
            ),

        deliveryFee:
            Number(
                orderData.deliveryFee || 0
            ),

        total,


        /* CUSTOMER */

        customerName:
            orderData.customerName || "",

        customerPhone:
            orderData.customerPhone || "",

        customerCity:
            orderData.customerCity || "",

        customerAddress:
            orderData.customerAddress || "",

        customerNote:
            orderData.customerNote || "",


        /* PAYMENT */

        paymentMethod:
            orderData.paymentMethod || "",

        paymentStatus:
            orderData.paymentStatus ||
            PAYMENT_ORDER_STATUS.PENDING,

        paymentId:
            null,

        transactionId:
            null,


        /* ORDER STATUS */

        status:
            ORDER_STATUS.PENDING,

        deliveryStatus:
            "pending",


        /* SELLER FINANCIAL DATA */

        commissionRate:
            0,

        commissionAmount:
            0,

        sellerEarning:
            0,

        earningStatus:
            "pending",


        /* SECURITY / TIMESTAMPS */

        createdAt:
            serverTimestamp(),

        updatedAt:
            serverTimestamp()
    };


    /*----------------------------------------------
    WRITE PENDING ORDER
    ----------------------------------------------*/

    await set(
        newOrderRef,
        newOrder
    );


    /*----------------------------------------------
    RETURN ORDER INFORMATION
    ----------------------------------------------*/

    return {

        firebaseKey:
            newOrderRef.key,

        orderId,

        userId:
            user.uid,

        total,

        paymentMethod:
            newOrder.paymentMethod,

        paymentStatus:
            newOrder.paymentStatus,

        status:
            newOrder.status
    };
}


/*==================================================
FEATURE: CANCEL PENDING ORDER
==================================================*/

export async function markOrderCancelled(orderKey) {

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

    await set(
        orderRef,
        {
            status:
                ORDER_STATUS.CANCELLED,

            paymentStatus:
                PAYMENT_ORDER_STATUS.CANCELLED,

            updatedAt:
                serverTimestamp()
        }
    );

    return true;
}
