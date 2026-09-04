/*==================================================
SMARTBAZAAR PRO 2
FEATURE: PAYMENT HISTORY
FILE: payment-history.js
==================================================*/

import {
    getDatabase,
    ref,
    get,
    query,
    orderByChild,
    equalTo
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import { app } from "./firebase-config.js";

/*==================================================
FEATURE: FIREBASE INITIALIZATION
==================================================*/

const db = getDatabase(app);
const auth = getAuth(app);

/*==================================================
FEATURE: PAYMENT HISTORY PATH
==================================================*/

const PAYMENTS_PATH = "payments";

/*==================================================
FEATURE: GET CURRENT USER
==================================================*/

function getCurrentUser() {

    const user = auth.currentUser;

    if (!user) {
        throw new Error(
            "Please login to view payment history."
        );
    }

    return user;
}

/*==================================================
FEATURE: GET USER PAYMENT HISTORY
==================================================*/

export async function getPaymentHistory() {

    const user = getCurrentUser();

    /*
     * Payments should contain:
     *
     * userId
     * orderId
     * paymentId
     * transactionId
     * paymentMethod
     * amount
     * currency
     * status
     * createdAt
     * updatedAt
     */

    const paymentsRef =
        ref(db, PAYMENTS_PATH);

    const paymentsQuery =
        query(
            paymentsRef,
            orderByChild("userId"),
            equalTo(user.uid)
        );

    const snapshot =
        await get(paymentsQuery);

    if (!snapshot.exists()) {
        return [];
    }

    const data =
        snapshot.val();

    const payments =
        Object.entries(data).map(
            ([key, payment]) => ({
                id: key,
                ...payment
            })
        );

    payments.sort(
        (a, b) =>
            Number(b.createdAt || 0) -
            Number(a.createdAt || 0)
    );

    return payments;
}

/*==================================================
FEATURE: GET PAYMENT BY ID
==================================================*/

export async function getPaymentById(paymentId) {

    if (!paymentId) {
        throw new Error("Payment ID is required.");
    }

    const user =
        getCurrentUser();

    const paymentRef =
        ref(
            db,
            `${PAYMENTS_PATH}/${paymentId}`
        );

    const snapshot =
        await get(paymentRef);

    if (!snapshot.exists()) {
        return null;
    }

    const payment =
        snapshot.val();

    /*
     * IMPORTANT:
     * Never allow one customer to read another
     * customer's payment through the frontend.
     */

    if (payment.userId !== user.uid) {
        throw new Error(
            "You are not authorized to view this payment."
        );
    }

    return {
        id: paymentId,
        ...payment
    };
}

/*==================================================
FEATURE: GET PAYMENTS FOR ORDER
==================================================*/

export async function getPaymentsForOrder(orderId) {

    if (!orderId) {
        throw new Error("Order ID is required.");
    }

    const user =
        getCurrentUser();

    const paymentsRef =
        ref(db, PAYMENTS_PATH);

    const paymentsQuery =
        query(
            paymentsRef,
            orderByChild("orderId"),
            equalTo(orderId)
        );

    const snapshot =
        await get(paymentsQuery);

    if (!snapshot.exists()) {
        return [];
    }

    const data =
        snapshot.val();

    const payments =
        Object.entries(data)
            .map(([key, payment]) => ({
                id: key,
                ...payment
            }))
            .filter(
                payment =>
                    payment.userId === user.uid
            );

    payments.sort(
        (a, b) =>
            Number(b.createdAt || 0) -
            Number(a.createdAt || 0)
    );

    return payments;
}

/*==================================================
FEATURE: FORMAT PAYMENT AMOUNT
==================================================*/

export function formatPaymentAmount(
    amount,
    currency = "PKR"
) {

    const numericAmount =
        Number(amount || 0);

    return `${currency} ${numericAmount.toLocaleString(
        "en-PK",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    )}`;
}

/*==================================================
FEATURE: FORMAT PAYMENT DATE
==================================================*/

export function formatPaymentDate(timestamp) {

    if (!timestamp) {
        return "—";
    }

    const date =
        new Date(Number(timestamp));

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString(
        "en-PK",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}

/*==================================================
FEATURE: PAYMENT HISTORY SUMMARY
==================================================*/

export function calculatePaymentHistorySummary(
    payments = []
) {

    let totalPaid = 0;
    let totalPending = 0;
    let totalFailed = 0;
    let totalRefunded = 0;

    payments.forEach(payment => {

        const amount =
            Number(payment.amount || 0);

        switch (
            String(payment.status || "")
                .toLowerCase()
        ) {

            case "paid":
                totalPaid += amount;
                break;

            case "pending":
            case "processing":
                totalPending += amount;
                break;

            case "failed":
            case "cancelled":
                totalFailed += amount;
                break;

            case "refunded":
                totalRefunded += amount;
                break;
        }
    });

    return {
        totalPaid,
        totalPending,
        totalFailed,
        totalRefunded,
        totalTransactions: payments.length
    };
}
