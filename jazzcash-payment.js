/*==================================================
SMARTBAZAAR PRO 2
FEATURE: JAZZCASH PAYMENT
FILE: jazzcash-payment.js

IMPORTANT:
REAL JAZZCASH MERCHANT CREDENTIALS MUST NEVER
BE STORED IN FRONTEND JAVASCRIPT.

FRONTEND → SECURE BACKEND → JAZZCASH
==================================================*/

import {
    PAYMENT_METHODS,
    PAYMENT_STATUS
} from "./payment-methods.js";

/*==================================================
FEATURE: JAZZCASH CONFIGURATION
==================================================*/

const JAZZCASH_CONFIG = {
    method: PAYMENT_METHODS.JAZZCASH,

    currency: "PKR",

    endpoints: {
        createPayment: "/api/payments/jazzcash/create",
        verifyPayment: "/api/payments/jazzcash/verify"
    }
};

/*==================================================
FEATURE: CREATE PAYMENT REQUEST
==================================================*/

export async function createJazzCashPayment(paymentData) {

    if (!paymentData) {
        throw new Error("Payment data is required.");
    }

    if (!paymentData.orderId) {
        throw new Error("Order ID is required.");
    }

    if (!paymentData.amount || Number(paymentData.amount) <= 0) {
        throw new Error("Invalid payment amount.");
    }

    const payload = {
        orderId: paymentData.orderId,
        amount: Number(paymentData.amount),
        currency: JAZZCASH_CONFIG.currency,
        customerName: paymentData.customerName || "",
        customerPhone: paymentData.customerPhone || "",
        description: paymentData.description || "SmartBazaar Pro Order"
    };

    const response = await fetch(
        JAZZCASH_CONFIG.endpoints.createPayment,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(payload)
        }
    );

    let result = null;

    try {
        result = await response.json();
    } catch {
        throw new Error("Invalid payment server response.");
    }

    if (!response.ok) {
        throw new Error(
            result?.message ||
            "Unable to create JazzCash payment."
        );
    }

    return result;
}

/*==================================================
FEATURE: VERIFY PAYMENT
==================================================*/

export async function verifyJazzCashPayment(paymentId) {

    if (!paymentId) {
        throw new Error("Payment ID is required.");
    }

    const response = await fetch(
        JAZZCASH_CONFIG.endpoints.verifyPayment,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                paymentId
            })
        }
    );

    let result = null;

    try {
        result = await response.json();
    } catch {
        throw new Error("Invalid verification response.");
    }

    if (!response.ok) {
        throw new Error(
            result?.message ||
            "Unable to verify JazzCash payment."
        );
    }

    return result;
}

/*==================================================
FEATURE: CHECK PAYMENT RESULT
==================================================*/

export function isJazzCashPaymentSuccessful(result) {

    if (!result) {
        return false;
    }

    return (
        result.success === true &&
        (
            result.paymentStatus === PAYMENT_STATUS.PAID ||
            result.status === PAYMENT_STATUS.PAID
        )
    );
}

/*==================================================
FEATURE: JAZZCASH PAYMENT PROCESS
==================================================*/

export async function processJazzCashPayment(paymentData) {

    const payment = await createJazzCashPayment(paymentData);

    if (!payment) {
        throw new Error("Payment initialization failed.");
    }

    /*
     * The secure backend may return:
     *
     * paymentId
     * redirectUrl
     * transactionId
     * status
     *
     * depending on the final JazzCash integration.
     */

    return payment;
}

/*==================================================
FEATURE: JAZZCASH PAYMENT STATUS
==================================================*/

export async function getJazzCashPaymentStatus(paymentId) {

    const result = await verifyJazzCashPayment(paymentId);

    return {
        success: isJazzCashPaymentSuccessful(result),
        status:
            result?.paymentStatus ||
            result?.status ||
            PAYMENT_STATUS.PENDING,
        transactionId:
            result?.transactionId ||
            null,
        paymentId:
            result?.paymentId ||
            paymentId
    };
}

/*==================================================
FEATURE: JAZZCASH CONFIG EXPORT
==================================================*/

export { JAZZCASH_CONFIG };
