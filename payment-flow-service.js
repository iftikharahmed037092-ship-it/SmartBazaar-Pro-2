/*==================================================
SMARTBAZAAR PRO 2
FEATURE: SECURE PAYMENT FLOW
FEATURE: JAZZCASH PAYMENT CREATION
FEATURE: PAYMENT VERIFICATION
FEATURE: ORDER AUTHORIZATION
FEATURE: PAYMENT FINALIZATION
==================================================*/

import {
    adminDb
} from "./firebase-admin.js";

import {
    createJazzCashPayment
} from "./jazzcash-create-payment.js";

import {
    verifyJazzCashPayment
} from "./jazzcash-verify-payment.js";

import {
    finalizeVerifiedPayment
} from "./payment-order-finalizer.js";


/*==================================================
HELPER: LOAD ORDER
==================================================*/

async function getOrder(orderId) {

    if (!orderId) {

        throw new Error(
            "Order ID is required."
        );
    }


    const snapshot =
        await adminDb
            .ref(`orders/${orderId}`)
            .once("value");


    if (!snapshot.exists()) {

        throw new Error(
            "Order not found."
        );
    }


    return {
        orderId,
        ...snapshot.val()
    };
}


/*==================================================
HELPER: VERIFY ORDER OWNERSHIP
==================================================*/

function verifyOrderOwnership(
    order,
    user
) {

    if (!user || !user.uid) {

        throw new Error(
            "Authenticated user is required."
        );
    }


    const orderUserId =
        order.userId ||
        order.customerId;


    if (
        !orderUserId ||
        orderUserId !== user.uid
    ) {

        const error =
            new Error(
                "You are not authorized to access this order."
            );

        error.statusCode = 403;

        throw error;
    }
}


/*==================================================
HELPER: VALIDATE ORDER
==================================================*/

function validatePaymentOrder(order) {

    if (!order.productId) {

        throw new Error(
            "Order product is missing."
        );
    }


    const total =
        Number(order.total);


    if (
        !Number.isFinite(total) ||
        total <= 0
    ) {

        throw new Error(
            "Invalid order amount."
        );
    }


    if (
        order.paymentMethod &&
        order.paymentMethod !== "jazzcash"
    ) {

        throw new Error(
            "This order is not configured for JazzCash."
        );
    }


    if (
        order.paymentStatus === "paid"
    ) {

        throw new Error(
            "This order has already been paid."
        );
    }
}


/*==================================================
CREATE JAZZCASH PAYMENT
==================================================*/

async function createAuthorizedJazzCashPayment({
    orderId,
    user
}) {

    const order =
        await getOrder(orderId);


    verifyOrderOwnership(
        order,
        user
    );


    validatePaymentOrder(
        order
    );


    const payment =
        await createJazzCashPayment({

            amount:
                Number(order.total),

            orderId:
                orderId,

            billReference:
                order.orderId ||
                orderId,

            description:
                `SmartBazaar Order ${orderId}`,

            customerMobile:
                order.customerPhone ||
                order.phone ||
                "",

            customerName:
                order.customerName ||
                "",

            returnUrl:
                order.paymentReturnUrl ||
                process.env.JAZZCASH_RETURN_URL ||
                ""
        });


    if (
        !payment ||
        !payment.success
    ) {

        throw new Error(
            payment?.message ||
            "JazzCash payment creation failed."
        );
    }


    /*----------------------------------------------
    STORE PAYMENT TRANSACTION REFERENCE
    ----------------------------------------------*/

    await adminDb
        .ref(`orders/${orderId}`)
        .update({

            paymentStatus:
                "processing",

            status:
                "payment_processing",

            paymentMethod:
                "jazzcash",

            paymentTransactionReference:
                payment.transactionReference,

            paymentGateway:
                "jazzcash",

            updatedAt:
                Date.now()

        });


    return {

        success: true,

        orderId,

        transactionReference:
            payment.transactionReference,

        action:
            payment.action,

        fields:
            payment.fields

    };
}


/*==================================================
VERIFY JAZZCASH PAYMENT
==================================================*/

async function verifyAndFinalizeJazzCashPayment({
    orderId,
    user,
    response
}) {

    const order =
        await getOrder(orderId);


    verifyOrderOwnership(
        order,
        user
    );


    /*----------------------------------------------
    ALREADY PAID = IDEMPOTENT RESPONSE
    ----------------------------------------------*/

    if (
        order.paymentStatus === "paid"
    ) {

        return {

            success: true,

            alreadyFinalized: true,

            orderId,

            paymentStatus:
                "paid"

        };
    }


    /*----------------------------------------------
    VERIFY TRANSACTION REFERENCE
    ----------------------------------------------*/

    const expectedReference =
        order.paymentTransactionReference;


    const receivedReference =
        response?.pp_TxnRefNo;


    if (
        !expectedReference ||
        !receivedReference
    ) {

        throw new Error(
            "Payment transaction reference is missing."
        );
    }


    if (
        expectedReference !==
        receivedReference
    ) {

        const error =
            new Error(
                "Payment transaction reference does not match the order."
            );

        error.statusCode = 400;

        throw error;
    }


    /*----------------------------------------------
    VERIFY JAZZCASH RESPONSE
    ----------------------------------------------*/

    const verification =
        await verifyJazzCashPayment(
            response
        );


    if (
        !verification ||
        !verification.success
    ) {

        await adminDb
            .ref(`orders/${orderId}`)
            .update({

                paymentStatus:
                    "failed",

                status:
                    "payment_failed",

                paymentFailureReason:
                    verification?.message ||
                    "JazzCash payment verification failed.",

                updatedAt:
                    Date.now()

            });


        return {

            success: false,

            orderId,

            paymentStatus:
                "failed",

            message:
                verification?.message ||
                "Payment verification failed."

        };
    }


    /*----------------------------------------------
    FINALIZE VERIFIED PAYMENT
    ----------------------------------------------*/

    const finalized =
        await finalizeVerifiedPayment({

            orderId,

            transactionReference:
                receivedReference,

            responseCode:
                response?.pp_ResponseCode

        });


    return {

        success: true,

        orderId,

        paymentStatus:
            "paid",

        transactionReference:
            receivedReference,

        finalization:
            finalized

    };
}


/*==================================================
EXPORTS
==================================================*/

export {
    getOrder,
    verifyOrderOwnership,
    validatePaymentOrder,
    createAuthorizedJazzCashPayment,
    verifyAndFinalizeJazzCashPayment
};
