/*==================================================
SMARTBAZAAR PRO 2
BACKEND
FEATURE: PAYMENT ORDER FINALIZER
FEATURE: VERIFIED PAYMENT
FEATURE: ORDER CONFIRMATION
FEATURE: STOCK DEDUCTION
FEATURE: IDEMPOTENCY
==================================================*/

import {
    adminDb
} from "./firebase-admin.js";

import {
    calculateCommission
} from "../commission.js";


/*==================================================
FEATURE: FINALIZE VERIFIED PAYMENT
==================================================*/

async function finalizeVerifiedPayment(
    paymentData
) {

    const {

        orderId,

        transactionReference,

        responseCode

    } = paymentData;


    if (!orderId) {

        throw new Error(
            "Order ID is required."
        );

    }


    if (!transactionReference) {

        throw new Error(
            "JazzCash transaction reference is required."
        );

    }


    /*==================================================
    FEATURE: LOAD ORDER
    ==================================================*/

    const orderRef =
        adminDb.ref(
            `orders/${orderId}`
        );


    const orderSnapshot =
        await orderRef.once(
            "value"
        );


    if (
        !orderSnapshot.exists()
    ) {

        throw new Error(
            "Order not found."
        );

    }


    const order =
        orderSnapshot.val();


    /*==================================================
    FEATURE: IDEMPOTENCY
    ==================================================*/

    if (
        order.paymentStatus === "paid"
    ) {

        return {

            success:
                true,

            alreadyProcessed:
                true,

            orderId:
                orderId,

            message:
                "Payment was already processed."

        };

    }


    /*==================================================
    FEATURE: ORDER AMOUNT
    ==================================================*/

    const orderTotal =
        Number(
            order.total || 0
        );


    if (
        !Number.isFinite(
            orderTotal
        ) ||
        orderTotal <= 0
    ) {

        throw new Error(
            "Invalid order amount."
        );

    }


    /*==================================================
    FEATURE: PRODUCT
    ==================================================*/

    const productId =
        order.productId;


    if (!productId) {

        throw new Error(
            "Order product is missing."
        );

    }


    const productRef =
        adminDb.ref(
            `products/${productId}`
        );


    const productSnapshot =
        await productRef.once(
            "value"
        );


    if (
        !productSnapshot.exists()
    ) {

        throw new Error(
            "Product no longer exists."
        );

    }


    const product =
        productSnapshot.val();


    const quantity =
        Number(
            order.quantity || 0
        );


    if (
        quantity <= 0
    ) {

        throw new Error(
            "Invalid order quantity."
        );

    }


    /*==================================================
    FEATURE: STOCK TRANSACTION
    ==================================================*/

    const stockResult =
        await productRef.transaction(
            currentStock => {

                const stock =
                    Number(
                        currentStock?.stock || 0
                    );


                if (
                    stock < quantity
                ) {

                    return;

                }


                return {

                    ...currentStock,

                    stock:
                        stock - quantity,

                    updatedAt:
                        Date.now()

                };

            }
        );


    if (
        !stockResult.committed
    ) {

        throw new Error(
            "Product stock is no longer available."
        );

    }


    /*==================================================
    FEATURE: SELLER
    ==================================================*/

    const sellerId =
        order.sellerId ||
        product.sellerId ||
        product.createdBy ||
        "";


    if (!sellerId) {

        throw new Error(
            "Seller information is missing."
        );

    }


    /*==================================================
    FEATURE: COMMISSION
    ==================================================*/

    const commissionResult =
        calculateCommission(
            orderTotal
        );


    const commissionAmount =
        Number(
            commissionResult
        );


    const sellerEarning =
        orderTotal -
        commissionAmount;


    /*==================================================
    FEATURE: PAYMENT RECORD
    ==================================================*/

    const paymentRef =
        adminDb.ref(
            "payments"
        );


    const paymentRecordRef =
        paymentRef.push();


    const paymentId =
        paymentRecordRef.key;


    const now =
        Date.now();


    const paymentRecord = {

        paymentId:
            paymentId,

        orderId:
            orderId,

        userId:
            order.userId ||
            order.customerId ||
            "",

        sellerId:
            sellerId,

        paymentMethod:
            "jazzcash",

        transactionReference:
            transactionReference,

        responseCode:
            responseCode ||
            "",

        amount:
            orderTotal,

        paymentStatus:
            "paid",

        verified:
            true,

        createdAt:
            now,

        updatedAt:
            now

    };


    /*==================================================
    FEATURE: ORDER UPDATE
    ==================================================*/

    const orderUpdates = {

        [`orders/${orderId}/paymentStatus`]:
            "paid",

        [`orders/${orderId}/status`]:
            "confirmed",

        [`orders/${orderId}/deliveryStatus`]:
            "pending",

        [`orders/${orderId}/sellerId`]:
            sellerId,

        [`orders/${orderId}/commissionAmount`]:
            commissionAmount,

        [`orders/${orderId}/sellerEarning`]:
            sellerEarning,

        [`orders/${orderId}/paymentId`]:
            paymentId,

        [`orders/${orderId}/transactionReference`]:
            transactionReference,

        [`orders/${orderId}/updatedAt`]:
            now,

        [`payments/${paymentId}`]:
            paymentRecord

    };


    await adminDb
        .ref()
        .update(
            orderUpdates
        );


    return {

        success:
            true,

        alreadyProcessed:
            false,

        orderId:
            orderId,

        paymentId:
            paymentId,

        sellerId:
            sellerId,

        grossAmount:
            orderTotal,

        commissionAmount:
            commissionAmount,

        sellerEarning:
            sellerEarning,

        message:
            "Payment verified and order confirmed."

    };

}


export {

    finalizeVerifiedPayment

};
