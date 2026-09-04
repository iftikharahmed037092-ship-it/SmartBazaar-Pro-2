/*==================================================
SMARTBAZAAR PRO 2
BACKEND
FEATURE: SELLER FINANCE SERVICE
FEATURE: SELLER WALLET
FEATURE: SELLER TRANSACTION
FEATURE: COMMISSION LEDGER
==================================================*/

import {
    adminDb
} from "./firebase-admin.js";


/*==================================================
FEATURE: CREDIT SELLER EARNING
==================================================*/

async function creditSellerEarning(
    financeData
) {

    const {

        orderId,

        sellerId,

        grossAmount,

        commissionAmount,

        sellerEarning

    } = financeData;


    if (!orderId) {

        throw new Error(
            "Order ID is required."
        );

    }


    if (!sellerId) {

        throw new Error(
            "Seller ID is required."
        );

    }


    const gross =
        Number(
            grossAmount
        );


    const commission =
        Number(
            commissionAmount
        );


    const earning =
        Number(
            sellerEarning
        );


    if (
        !Number.isFinite(gross) ||
        !Number.isFinite(commission) ||
        !Number.isFinite(earning) ||
        gross <= 0 ||
        commission < 0 ||
        earning < 0
    ) {

        throw new Error(
            "Invalid seller finance values."
        );

    }


    /*==================================================
    FEATURE: DUPLICATE PROTECTION
    ==================================================*/

    const transactionRef =
        adminDb.ref(
            `sellerTransactions/${sellerId}/${orderId}`
        );


    const existingSnapshot =
        await transactionRef.once(
            "value"
        );


    if (
        existingSnapshot.exists()
    ) {

        return {

            success:
                true,

            alreadyProcessed:
                true,

            message:
                "Seller earning was already credited."

        };

    }


    /*==================================================
    FEATURE: WALLET
    ==================================================*/

    const walletRef =
        adminDb.ref(
            `sellerWallets/${sellerId}`
        );


    const walletResult =
        await walletRef.transaction(
            currentWallet => {

                const wallet =
                    currentWallet || {};


                return {

                    availableBalance:
                        Number(
                            wallet.availableBalance || 0
                        ) + earning,

                    pendingBalance:
                        Number(
                            wallet.pendingBalance || 0
                        ),

                    withdrawnBalance:
                        Number(
                            wallet.withdrawnBalance || 0
                        ),

                    totalEarned:
                        Number(
                            wallet.totalEarned || 0
                        ) + earning,

                    totalCommission:
                        Number(
                            wallet.totalCommission || 0
                        ) + commission,

                    totalSales:
                        Number(
                            wallet.totalSales || 0
                        ) + gross,

                    updatedAt:
                        Date.now()

                };

            }
        );


    if (
        !walletResult.committed
    ) {

        throw new Error(
            "Unable to update seller wallet."
        );

    }


    /*==================================================
    FEATURE: TRANSACTION RECORD
    ==================================================*/

    const transactionRecord = {

        transactionId:
            orderId,

        orderId:
            orderId,

        sellerId:
            sellerId,

        type:
            "earning",

        grossAmount:
            gross,

        commissionAmount:
            commission,

        amount:
            earning,

        status:
            "completed",

        createdAt:
            Date.now()

    };


    await transactionRef.set(
        transactionRecord
    );


    /*==================================================
    FEATURE: COMMISSION RECORD
    ==================================================*/

    const commissionRef =
        adminDb.ref(
            `commissions/${orderId}`
        );


    await commissionRef.set({

        orderId:
            orderId,

        sellerId:
            sellerId,

        grossAmount:
            gross,

        commissionAmount:
            commission,

        sellerEarning:
            earning,

        status:
            "collected",

        createdAt:
            Date.now()

    });


    return {

        success:
            true,

        alreadyProcessed:
            false,

        sellerId:
            sellerId,

        amount:
            earning,

        message:
            "Seller earning credited successfully."

    };

}


export {

    creditSellerEarning

};
