/*==================================================
SMARTBAZAAR PRO 2
BACKEND
FEATURE: JAZZCASH PAYMENT VERIFICATION
FEATURE: RESPONSE HASH VALIDATION
FEATURE: PAYMENT STATUS
==================================================*/

import crypto from "crypto";

import {
    JAZZCASH_CONFIG
} from "./jazzcash-config.js";

import {
    createSecureHash
} from "./jazzcash-create-payment.js";


/*==================================================
FEATURE: SUCCESS RESPONSE CODES
==================================================*/

const SUCCESS_CODES = [

    "000",

    "00"

];


/*==================================================
FEATURE: VERIFY RESPONSE HASH
==================================================*/

function verifyJazzCashResponseHash(
    response
) {

    if (
        !response ||
        !response.pp_SecureHash
    ) {

        return false;

    }


    const receivedHash =
        String(
            response.pp_SecureHash
        )
        .toUpperCase();


    const calculatedHash =
        createSecureHash(
            response
        );


    return crypto.timingSafeEqual(

        Buffer.from(
            receivedHash
        ),

        Buffer.from(
            calculatedHash
        )

    );

}


/*==================================================
FEATURE: CHECK PAYMENT SUCCESS
==================================================*/

function isJazzCashSuccessful(
    response
) {

    if (!response) {

        return false;

    }


    const responseCode =
        String(
            response.pp_ResponseCode ||
            ""
        );


    return SUCCESS_CODES.includes(
        responseCode
    );

}


/*==================================================
FEATURE: VERIFY PAYMENT RESPONSE
==================================================*/

async function verifyJazzCashPayment(
    response
) {

    if (!response) {

        throw new Error(
            "Empty JazzCash response."
        );

    }


    const hashValid =
        verifyJazzCashResponseHash(
            response
        );


    if (!hashValid) {

        return {

            success:
                false,

            verified:
                false,

            paymentStatus:
                "failed",

            message:
                "JazzCash response security verification failed."

        };

    }


    const paymentSuccessful =
        isJazzCashSuccessful(
            response
        );


    if (!paymentSuccessful) {

        return {

            success:
                false,

            verified:
                true,

            paymentStatus:
                "failed",

            responseCode:
                response.pp_ResponseCode ||
                "",

            message:
                response.pp_ResponseMessage ||
                "JazzCash payment failed."

        };

    }


    return {

        success:
            true,

        verified:
            true,

        paymentStatus:
            "paid",

        transactionReference:
            response.pp_TxnRefNo ||
            "",

        responseCode:
            response.pp_ResponseCode ||
            "",

        message:
            response.pp_ResponseMessage ||
            "Payment successful."

    };

}


export {

    verifyJazzCashPayment,

    verifyJazzCashResponseHash,

    isJazzCashSuccessful

};
