/*==================================================
SMARTBAZAAR PRO 2
BACKEND
FEATURE: JAZZCASH PAYMENT CREATION
FEATURE: SECURE HASH
FEATURE: PAYMENT REQUEST
==================================================*/

import crypto from "crypto";

import {
    JAZZCASH_CONFIG,
    getJazzCashBaseUrl,
    validateJazzCashConfig
} from "./jazzcash-config.js";


/*==================================================
FEATURE: GENERATE TRANSACTION REFERENCE
==================================================*/

function generateTransactionReference() {

    return (
        "SB" +
        Date.now().toString() +
        Math.floor(
            Math.random() * 1000
        )
    );

}


/*==================================================
FEATURE: FORMAT AMOUNT
==================================================*/

function formatAmount(
    amount
) {

    const numericAmount =
        Number(
            amount
        );


    if (
        !Number.isFinite(
            numericAmount
        ) ||
        numericAmount <= 0
    ) {

        throw new Error(
            "Invalid payment amount."
        );

    }


    /*
     * JazzCash amount formatting can depend
     * on the selected integration.
     *
     * Do not silently modify merchant-specific
     * amount rules.
     */

    return String(
        Math.round(
            numericAmount * 100
        )
    );

}


/*==================================================
FEATURE: CREATE SECURE HASH
==================================================*/

function createSecureHash(
    fields
) {

    const salt =
        JAZZCASH_CONFIG.integritySalt;


    if (!salt) {

        throw new Error(
            "JazzCash Integrity Salt is not configured."
        );

    }


    const keys =
        Object.keys(
            fields
        )
        .filter(
            key =>
                key !== "pp_SecureHash" &&
                fields[key] !== undefined &&
                fields[key] !== null &&
                fields[key] !== ""
        )
        .sort();


    const values =
        keys.map(
            key =>
                String(
                    fields[key]
                )
        );


    const message =
        salt +
        values.join("");


    return crypto
        .createHash("sha256")
        .update(message)
        .digest("hex")
        .toUpperCase();

}


/*==================================================
FEATURE: CREATE PAYMENT REQUEST
==================================================*/

async function createJazzCashPayment(
    paymentData
) {

    const configStatus =
        validateJazzCashConfig();


    if (
        !configStatus.valid
    ) {

        throw new Error(
            "JazzCash backend credentials are not configured."
        );

    }


    const {

        amount,

        orderId,

        customerName,

        customerPhone,

        returnUrl

    } = paymentData;


    if (!orderId) {

        throw new Error(
            "Order ID is required."
        );

    }


    if (!returnUrl) {

        throw new Error(
            "Return URL is required."
        );

    }


    const txnRefNo =
        generateTransactionReference();


    const now =
        new Date();


    const txnDateTime =
        formatJazzCashDate(
            now
        );


    const expiry =
        new Date(
            now.getTime() +
            (
                JAZZCASH_CONFIG
                    .transactionExpiryMinutes *
                60 *
                1000
            )
        );


    const txnExpiryDateTime =
        formatJazzCashDate(
            expiry
        );


    const fields = {

        pp_Version:
            JAZZCASH_CONFIG.version,

        pp_TxnType:
            "",

        pp_IsRegisteredCustomer:
            "Yes",

        pp_MerchantID:
            JAZZCASH_CONFIG.merchantId,

        pp_SubMerchantID:
            "",

        pp_Password:
            JAZZCASH_CONFIG.password,

        pp_TxnRefNo:
            txnRefNo,

        pp_Amount:
            formatAmount(amount),

        pp_TxnCurrency:
            JAZZCASH_CONFIG.currency,

        pp_TxnDateTime:
            txnDateTime,

        pp_TxnExpiryDateTime:
            txnExpiryDateTime,

        pp_BillReference:
            String(orderId),

        pp_Description:
            `SmartBazaar Order ${orderId}`,

        pp_ReturnURL:
            returnUrl,

        pp_Language:
            JAZZCASH_CONFIG.language,

        pp_CustomerMobile:
            customerPhone || "",

        pp_CustomerName:
            customerName || ""

    };


    fields.pp_SecureHash =
        createSecureHash(
            fields
        );


    return {

        success:
            true,

        transactionReference:
            txnRefNo,

        action:
            getJazzCashBaseUrl(),

        fields:
            fields

    };

}


/*==================================================
FEATURE: JAZZCASH DATE FORMAT
==================================================*/

function formatJazzCashDate(
    date
) {

    const pad =
        value =>
            String(value)
                .padStart(
                    2,
                    "0"
                );


    return (
        date.getFullYear() +
        pad(
            date.getMonth() + 1
        ) +
        pad(
            date.getDate()
        ) +
        pad(
            date.getHours()
        ) +
        pad(
            date.getMinutes()
        ) +
        pad(
            date.getSeconds()
        )
    );

}


export {

    createJazzCashPayment,

    createSecureHash

};
