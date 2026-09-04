/*==================================================
SMARTBAZAAR PRO 2
FEATURE: SELLER EARNINGS SYSTEM
FILE: seller-earnings.js

PURPOSE:
Load seller earnings from verified orders.

IMPORTANT:
Only PAID/verified orders are considered earnings.
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
FEATURE: GET CURRENT SELLER
==================================================*/

function getCurrentSeller() {

    const user =
        auth.currentUser;

    if (!user) {

        throw new Error(
            "Please login to view seller earnings."
        );
    }

    return user;
}


/*==================================================
FEATURE: GET SELLER PAID ORDERS
==================================================*/

export async function getSellerPaidOrders() {

    const user =
        getCurrentSeller();


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


    return Object.entries(data)

        .map(
            ([key, order]) => ({
                firebaseKey: key,
                ...order
            })
        )

        .filter(
            order =>
                String(
                    order.paymentStatus || ""
                ).toLowerCase() === "paid"
        )

        .sort(
            (a, b) =>
                Number(
                    b.paymentVerifiedAt ||
                    b.createdAt ||
                    0
                ) -
                Number(
                    a.paymentVerifiedAt ||
                    a.createdAt ||
                    0
                )
        );
}


/*==================================================
FEATURE: CALCULATE SELLER EARNINGS
==================================================*/

export function calculateSellerEarnings(
    orders = []
) {

    let grossSales = 0;

    let commissionTotal = 0;

    let sellerEarning = 0;

    let orderCount = 0;


    orders.forEach(order => {

        if (
            String(
                order.paymentStatus || ""
            ).toLowerCase() !== "paid"
        ) {
            return;
        }


        const gross =
            Number(
                order.subtotal ??
                order.total ??
                0
            );


        const commission =
            Number(
                order.commissionAmount || 0
            );


        const earning =
            Number(
                order.sellerEarning ??
                (gross - commission)
            );


        grossSales += gross;

        commissionTotal += commission;

        sellerEarning += earning;

        orderCount++;

    });


    return {

        grossSales:
            Number(
                grossSales.toFixed(2)
            ),

        commissionTotal:
            Number(
                commissionTotal.toFixed(2)
            ),

        sellerEarning:
            Number(
                sellerEarning.toFixed(2)
            ),

        orderCount
    };
}


/*==================================================
FEATURE: GET SELLER EARNINGS SUMMARY
==================================================*/

export async function getSellerEarningsSummary() {

    const orders =
        await getSellerPaidOrders();

    return calculateSellerEarnings(
        orders
    );
}


/*==================================================
FEATURE: GET ORDER EARNING
==================================================*/

export function getOrderSellerEarning(
    order
) {

    if (!order) {
        return 0;
    }


    if (
        String(
            order.paymentStatus || ""
        ).toLowerCase() !== "paid"
    ) {
        return 0;
    }


    if (
        order.sellerEarning !== undefined
    ) {

        return Number(
            order.sellerEarning || 0
        );
    }


    const gross =
        Number(
            order.subtotal ??
            order.total ??
            0
        );


    const commission =
        Number(
            order.commissionAmount || 0
        );


    return Math.max(
        0,
        gross - commission
    );
}
