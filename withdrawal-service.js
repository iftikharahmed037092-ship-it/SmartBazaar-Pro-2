/*==================================================
SMARTBAZAAR PRO 2
BACKEND
FEATURE: SELLER WITHDRAWAL SERVICE
FEATURE: WALLET VALIDATION
FEATURE: WITHDRAWAL REQUEST
FEATURE: BALANCE RESERVATION
==================================================*/

import {
    adminDb
} from "./firebase-admin.js";


/*==================================================
FEATURE: MINIMUM WITHDRAWAL
==================================================*/

const MINIMUM_WITHDRAWAL =
    100;


/*==================================================
FEATURE: PAKISTANI JAZZCASH NUMBER
==================================================*/

function isValidJazzCashNumber(
    phone
) {

    return /^03\d{9}$/.test(
        String(
            phone || ""
        )
    );

}


/*==================================================
FEATURE: CREATE WITHDRAWAL REQUEST
==================================================*/

async function createWithdrawalRequest(
    withdrawalData
) {

    const {

        sellerId,

        sellerEmail,

        amount,

        jazzCashNumber

    } = withdrawalData;


    if (!sellerId) {

        throw new Error(
            "Seller authentication is required."
        );

    }


    const withdrawalAmount =
        Number(
            amount
        );


    if (
        !Number.isFinite(
            withdrawalAmount
        ) ||
        withdrawalAmount <
        MINIMUM_WITHDRAWAL
    ) {

        throw new Error(
            `Minimum withdrawal is Rs. ${MINIMUM_WITHDRAWAL}.`
        );

    }


    if (
        !isValidJazzCashNumber(
            jazzCashNumber
        )
    ) {

        throw new Error(
            "Invalid JazzCash mobile number."
        );

    }


    /*==================================================
    FEATURE: WALLET REFERENCE
    ==================================================*/

    const walletRef =
        adminDb.ref(
            `sellerWallets/${sellerId}`
        );


    /*==================================================
    FEATURE: RESERVE BALANCE
    ==================================================*/

    const walletResult =
        await walletRef.transaction(
            currentWallet => {

                if (
                    !currentWallet
                ) {

                    return;

                }


                const available =
                    Number(
                        currentWallet.availableBalance || 0
                    );


                if (
                    available <
                    withdrawalAmount
                ) {

                    return;

                }


                return {

                    ...currentWallet,

                    availableBalance:
                        available -
                        withdrawalAmount,

                    pendingBalance:
                        Number(
                            currentWallet.pendingBalance || 0
                        ) +
                        withdrawalAmount,

                    updatedAt:
                        Date.now()

                };

            }
        );


    if (
        !walletResult.committed
    ) {

        throw new Error(
            "Insufficient available balance or wallet update failed."
        );

    }


    /*==================================================
    FEATURE: WITHDRAWAL ID
    ==================================================*/

    const withdrawalsRef =
        adminDb.ref(
            "withdrawals"
        );


    const withdrawalRef =
        withdrawalsRef.push();


    const withdrawalId =
        withdrawalRef.key;


    /*==================================================
    FEATURE: WITHDRAWAL RECORD
    ==================================================*/

    const withdrawalRecord = {

        withdrawalId:
            withdrawalId,

        sellerId:
            sellerId,

        sellerEmail:
            sellerEmail ||
            "",

        amount:
            withdrawalAmount,

        paymentMethod:
            "jazzcash",

        jazzCashNumber:
            jazzCashNumber,

        status:
            "pending",

        payoutTransactionId:
            "",

        createdAt:
            Date.now(),

        updatedAt:
            Date.now()

    };


    try {

        await withdrawalRef.set(
            withdrawalRecord
        );

    }

    catch (error) {

        /*
         * Roll back reserved balance
         * if withdrawal record creation fails.
         */

        await walletRef.transaction(
            currentWallet => {

                if (
                    !currentWallet
                ) {

                    return;

                }


                return {

                    ...currentWallet,

                    availableBalance:
                        Number(
                            currentWallet.availableBalance || 0
                        ) +
                        withdrawalAmount,

                    pendingBalance:
                        Math.max(
                            0,
                            Number(
                                currentWallet.pendingBalance || 0
                            ) -
                            withdrawalAmount
                        ),

                    updatedAt:
                        Date.now()

                };

            }
        );


        throw error;

    }


    return {

        success:
            true,

        withdrawalId:
            withdrawalId,

        amount:
            withdrawalAmount,

        status:
            "pending",

        message:
            "Withdrawal request created successfully."

    };

}


export {

    createWithdrawalRequest,

    MINIMUM_WITHDRAWAL

};
